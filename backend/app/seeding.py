from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.rule import Rule

SUSPICIOUS_PROCESS_NAMES = [
    "nc",
    "netcat",
    "ncat",
    "tcpdump",
    "socat",
    "chisel",
    "proxychains",
]

DEFAULT_RULES = [
    {
        "name": "Suspicious Process",
        "rule_type": "match",
        "event_type": "process.creation",
        "conditions": {"field": "name", "in": SUSPICIOUS_PROCESS_NAMES},
        "severity": "High",
    },
    {
        "name": "SSH Brute Force",
        "rule_type": "threshold",
        "event_type": "authentication.failure",
        "conditions": {"group_by": "source_ip", "threshold": 3, "window_seconds": 60},
        "severity": "High",
    },
    {
        "name": "Root Login",
        "rule_type": "match",
        "event_type": "authentication.success",
        "conditions": {"field": "user", "in": ["root"]},
        "severity": "Medium",
    },
]


def seed_default_rules(db: Session):
    existing = set(db.scalars(select(Rule.name)).all())

    missing = [rule for rule in DEFAULT_RULES if rule["name"] not in existing]
    if not missing:
        return 0

    for rule in missing:
        db.add(Rule(**rule))

    db.commit()
    return len(missing)
