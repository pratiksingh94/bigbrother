from app.models.event import Event
from app.models.detection import Detection
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

def run_detection(): 
    with SessionLocal() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=30)

        stmt = select(Event).where(
            Event.event_type == "process.creation",
            Event.created_at >= cutoff
        )
        events = db.scalars(stmt).all()

        already_detected = set(
            eid for (evs,) in db.execute(select(Detection.events)).all()
            for eid in evs
        )

        for ev in events:
            if ev.id in already_detected:
                continue
            name = ev.payload.get("Name", "")
            if name in SUS_NAMES:
                print("got one")
                detection = Detection(
                    rule_name="Sus Process",
                    severity="High",
                    events=[ev.id],
                    context={"name": name, "PID": ev.payload.get("PID")}
                )
                db.add(detection)
        
        db.commit()