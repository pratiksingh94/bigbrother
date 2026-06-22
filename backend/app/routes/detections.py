from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from app.models.detection import Detection
from app.models.event import Event
from app.db import get_db
from app.schemas.detections import DetectionsResponse, DetectionResponse
from app.schemas.events import EventResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import Literal

router = APIRouter()

@router.get("/", response_model=DetectionsResponse)
async def get_detecions(db: Session = Depends(get_db)):
    stmt = select(Detection).order_by(Detection.created_at.desc()).limit(100)
    detections = db.scalars(stmt).all()

    all_events_id = {eid for d in detections for eid in d.events}
    events_stmt = select(Event).where(Event.id.in_(all_events_id)).options(joinedload(Event.agent))
    events_by_id = {e.id: e for e in db.scalars(events_stmt).all() }

    return {
        "detections": [
            DetectionResponse(
                **d.__dict__,
                triggering_events=[EventResponse.model_validate(events_by_id[eid]) for eid in d.events if eid in events_by_id]
            ) for d in detections
        ]
    }

@router.get("/{id}", response_model=DetectionResponse)
async def get_detection(id: int, db: Session = Depends(get_db)):
    stmt = select(Detection).where(Detection.id == id)
    detection = db.execute(stmt).scalar_one_or_none()

    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    
    event_stmt = select(Event).where(Event.id.in_(detection.events)).options(joinedload(Event.agent))
    triggering_events = db.scalars(event_stmt).all()

    return DetectionResponse(
        id=detection.id,
        rule_name=detection.rule_name,
        severity=detection.severity,
        status=detection.status,
        context=detection.context,
        created_at=detection.created_at,
        triggering_events=[EventResponse.model_validate(e) for e in triggering_events]
    )


class StatusUpdate(BaseModel):
    status: Literal["open", "resolved", "false-positive", "investigating"]

@router.patch("/{id}/status")
async def update_status(id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    stmt = select(Detection).where(Detection.id == id)
    detection = db.execute(stmt).scalar_one_or_none()

    if not detection:
        raise HTTPException(status_code=404, detail="detection not found")
    
    detection.status = data.status
    db.commit()

    return {"status": "ok"}
