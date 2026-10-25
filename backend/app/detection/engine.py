import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.detection.match import evaluate_match_rule
from app.detection.threshold import evaluate_threshold_rule
from app.models.rule import Rule

logger = logging.getLogger(__name__)


def run_detection_engine() -> None:
    with SessionLocal() as db:
        rules = db.scalars(select(Rule).where(Rule.enabled.is_(True))).all()

        for rule in rules:
            _evaluate_rule(db, rule)

        db.commit()


def _evaluate_rule(db: Session, rule: Rule) -> None:
    name, rule_id = rule.name, rule.id

    try:
        with db.begin_nested():
            _dispatch_rule(db, rule)
    except Exception:
        logger.exception(
            "detection rule %r (id=%s) could not be evaluated and was skipped",
            name,
            rule_id,
        )


def _dispatch_rule(db: Session, rule: Rule) -> None:
    if rule.rule_type == "match":
        evaluate_match_rule(db, rule)
    elif rule.rule_type == "threshold":
        evaluate_threshold_rule(db, rule)
    else:
        raise ValueError(f"unknown rule type {rule.rule_type!r}")
