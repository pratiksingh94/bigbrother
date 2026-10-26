import json
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.alerts.formats import SEVERITY_ORDER, build_payload
from app.db import SessionLocal
from app.models.alert_channel import AlertChannel
from app.models.detection import Detection
from app.models.event import Event
from app.models.notification import Notification

TIMEOUT_SECONDS = 5
MAX_ATTEMPTS = 5
LOOKBACK_MINUTES = 10
USER_AGENT = "BigBrother/0.1.0"


def notify_recent_detections() -> None:
    with SessionLocal() as db:
        _notify(db)
        db.commit()


def severity_allows(min_severity: str, severity: str) -> bool:
    return SEVERITY_ORDER.get(severity, 0) >= SEVERITY_ORDER.get(min_severity, 1)


def summarize(detection: Detection, events: list[Event]) -> dict:
    return {
        "id": detection.id,
        "rule": detection.rule_name,
        "severity": detection.severity,
        "status": detection.status,
        "context": detection.context or {},
        "created_at": detection.created_at.isoformat(),
        "hosts": sorted({event.agent.hostname for event in events if event.agent}),
        "event_types": sorted({event.event_type for event in events}),
        "event_count": len(events),
    }


def deliver(
    db: Session, channel: AlertChannel, detection: Detection, summary: dict
) -> bool:
    existing = db.scalar(
        select(Notification).where(
            Notification.detection_id == detection.id,
            Notification.channel_id == channel.id,
        )
    )

    if existing and (existing.status == "sent" or existing.attempts >= MAX_ATTEMPTS):
        return False

    error = post(channel.url, build_payload(channel.kind, summary))
    now = datetime.now(timezone.utc)

    if existing:
        existing.attempts += 1
        existing.error = error
        existing.status = "failed" if error else "sent"
        existing.sent_at = now
    else:
        db.add(
            Notification(
                detection_id=detection.id,
                channel_id=channel.id,
                channel_name=channel.name,
                status="failed" if error else "sent",
                error=error,
                attempts=1,
                sent_at=now,
            )
        )

    return error is None


def send_test(channel: AlertChannel) -> str | None:
    summary = {
        "id": 0,
        "rule": "Test notification",
        "severity": "High",
        "status": "open",
        "context": {"source": "bigbrother", "message": "This is what an alert looks like"},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "hosts": ["example-host"],
        "event_types": ["process.creation"],
        "event_count": 1,
    }

    return post(channel.url, build_payload(channel.kind, summary))


def post(url: str, body: dict) -> str | None:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            if resp.status >= 300:
                return f"unexpected status {resp.status}"
            return None
    except urllib.error.HTTPError as exc:
        return f"http {exc.code}: {_body(exc)}"
    except Exception as exc:
        return str(exc)


def _notify(db: Session) -> None:
    channels = db.scalars(select(AlertChannel).where(AlertChannel.enabled.is_(True))).all()
    if not channels:
        return

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=LOOKBACK_MINUTES)
    detections = db.scalars(select(Detection).where(Detection.created_at >= cutoff)).all()
    if not detections:
        return

    events = _load_events(db, detections)

    for detection in detections:
        summary = summarize(detection, events.get(detection.id, []))

        for channel in channels:
            if not severity_allows(channel.min_severity, detection.severity):
                continue
            deliver(db, channel, detection, summary)


def _load_events(db: Session, detections: list[Detection]) -> dict[int, list[Event]]:
    event_ids = [eid for detection in detections for eid in detection.events]
    if not event_ids:
        return {}

    events = db.scalars(
        select(Event).where(Event.id.in_(event_ids)).options(joinedload(Event.agent))
    ).all()
    by_id = {event.id: event for event in events}

    grouped = defaultdict(list)
    for detection in detections:
        grouped[detection.id] = [by_id[eid] for eid in detection.events if eid in by_id]

    return grouped


def _body(resp) -> str:
    try:
        return resp.read()[:200].decode(errors="replace").strip()
    except Exception:
        return ""
