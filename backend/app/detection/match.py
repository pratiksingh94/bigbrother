from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.detection.conditions import match_conditions
from app.models.detection import Detection
from app.models.event import Event
from app.models.rule import Rule
from app.schemas.rules import MatchConditions

# The engine runs on a timer, so a match rule only needs to look at the events
# that arrived since the last run.
LOOKBACK_SECONDS = 30


def evaluate_match_rule(db: Session, rule: Rule) -> None:
    conditions: MatchConditions = match_conditions(rule)
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=LOOKBACK_SECONDS)

    events = db.scalars(
        select(Event).where(
            Event.event_type == rule.event_type,
            Event.created_at >= cutoff,
        )
    ).all()
    if not events:
        return

    detected = _already_detected(db, rule, cutoff)
    wanted = set(conditions.values)

    for event in events:
        if event.id in detected:
            continue

        value = event.payload.get(conditions.field)
        if value in wanted:
            db.add(
                Detection(
                    rule_name=rule.name,
                    severity=rule.severity,
                    events=[event.id],
                    context={conditions.field: value},
                    status="open",
                )
            )


def _already_detected(db: Session, rule: Rule, cutoff: datetime) -> set[int]:
    stmt = select(Detection.events).where(
        Detection.rule_name == rule.name,
        Detection.created_at >= cutoff,
    )
    return {event_id for (events,) in db.execute(stmt) for event_id in events}
