from collections import defaultdict
from app.models.event import Event
from app.models.detection import Detection
from app.models.rule import Rule
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.db import SessionLocal

SUS_NAMES = {
    "nc",
    "netcat",
    "ncat",
    "tcpdump"
}



def run_detection_engine():
    with SessionLocal() as db:
        rules = db.scalars(select(Rule).where(Rule.enabled == True)).all()
        for rule in rules:
            if rule.rule_type == "match":
                evaluate_match_rule(db, rule)
            elif rule.rule_type == "threshold":
                evaluate_threshold_rule(db, rule)

        db.commit()


def evaluate_match_rule(db, rule):
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=30)
    stmt = select(Event).where(Event.event_type == rule.event_type, Event.created_at >= cutoff)
    events = db.scalars(stmt).all()

    already_detected = set(
        eid for (evs,) in db.execute(select(Detection.events)).all()
        for eid in evs
    )

    field = rule.conditions["field"]
    values = set(rule.conditions["in"])

    for ev in events:
        if ev.id in already_detected:
            continue

        val = ev.payload.get(field)
        if val in values:
            db.add(Detection(
                rule_name=rule.name,
                severity=rule.severity,
                events=[ev.id],
                context={field: val},
                status="open"
            ))


def evaluate_threshold_rule(db, rule: Rule):
    window = rule.conditions["window_seconds"]
    group_by = rule.conditions["group_by"]
    threshold = rule.conditions["threshold"]

    cutoff = datetime.now(timezone.utc) - timedelta(seconds=window)
    stmt = select(Event).where(
        Event.event_type == rule.event_type,
        Event.created_at >= cutoff
    )
    events = db.scalars(stmt).all()

    grouped = defaultdict(list)
    for ev in events:
        key = ev.payload.get(group_by)
        grouped[key].append(ev.id)
    
    for key, event_ids in grouped.items():
        if len(event_ids) < threshold:
            continue
        
        existing = db.scalar(
            select(Detection).where(
                Detection.rule_name == rule.name,
                Detection.status == "open",
                Detection.context[group_by].astext == str(key)
            )
        )

        if existing:
            merged = list(set(existing.events) | set(event_ids))
            existing.events = merged
            existing.context = {**existing.context, "count": len(merged)}
        else:
            db.add(Detection(
                rule_name=rule.name,
                severity=rule.severity,
                status="open",
                events=event_ids,
                context={group_by: key, "count": len(event_ids)},
            ))