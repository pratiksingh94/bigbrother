from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.detection.conditions import threshold_conditions
from app.detection.payload import lookup
from app.models.detection import Detection
from app.models.event import Event
from app.models.rule import Rule
from app.schemas.rules import ThresholdConditions


def evaluate_threshold_rule(db: Session, rule: Rule) -> None:
    conditions: ThresholdConditions = threshold_conditions(rule)
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=conditions.window_seconds)

    events = db.scalars(
        select(Event).where(
            Event.event_type == rule.event_type,
            Event.created_at >= cutoff,
        )
    ).all()

    grouped = defaultdict(list)
    for event in events:
        key = lookup(event.payload, conditions.group_by)
        if key is None:
            # The event does not carry the field the rule groups by, so it
            # cannot belong to any group.
            continue
        grouped[key].append(event.id)

    for key, event_ids in grouped.items():
        if len(event_ids) < conditions.threshold:
            continue

        existing = _open_detection(db, rule, conditions.group_by, key)

        if existing:
            merged = sorted(set(existing.events) | set(event_ids))
            existing.events = merged
            existing.context = {**existing.context, "count": len(merged)}
        else:
            db.add(
                Detection(
                    rule_name=rule.name,
                    severity=rule.severity,
                    status="open",
                    events=event_ids,
                    context={conditions.group_by: key, "count": len(event_ids)},
                )
            )


def _open_detection(
    db: Session, rule: Rule, group_by: str, key: object
) -> Detection | None:
    """Return the still open detection of `rule` for `key`, if there is one."""
    return db.scalar(
        select(Detection).where(
            Detection.rule_name == rule.name,
            Detection.status == "open",
            func.lower(Detection.context[group_by].astext) == str(key).lower(),
        )
    )
