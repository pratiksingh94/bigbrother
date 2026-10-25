from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import Literal

from app.db import get_db
from app.models.detection import Detection
from app.models.event import Event
from app.schemas.detections import DetectionsResponse, DetectionResponse
from app.schemas.events import EventResponse

router = APIRouter()


@router.get("/", response_model=DetectionsResponse)
async def get_detections(db: Session = Depends(get_db)):
    stmt = select(Detection).order_by(Detection.created_at.desc()).limit(100)
    detections = db.scalars(stmt).all()

    events_by_id = _load_events(db, [eid for d in detections for eid in d.events])

    return {
        "detections": [_to_response(d, events_by_id) for d in detections]
    }


@router.get("/{id}", response_model=DetectionResponse)
async def get_detection(id: int, db: Session = Depends(get_db)):
    stmt = select(Detection).where(Detection.id == id)
    detection = db.execute(stmt).scalar_one_or_none()

    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")

    events_by_id = _load_events(db, detection.events)

    return _to_response(detection, events_by_id)


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


def _load_events(db: Session, event_ids: list[int]) -> dict[int, Event]:
    if not event_ids:
        return {}

    stmt = (
        select(Event)
        .where(Event.id.in_(event_ids))
        .options(joinedload(Event.agent), joinedload(Event.log))
    )
    return {event.id: event for event in db.scalars(stmt).all()}


def _to_response(detection: Detection, events_by_id: dict[int, Event]) -> DetectionResponse:
    return DetectionResponse(
        id=detection.id,
        rule_name=detection.rule_name,
        severity=detection.severity,
        status=detection.status,
        context=detection.context,
        created_at=detection.created_at,
        triggering_events=[
            EventResponse.model_validate(events_by_id[eid])
            for eid in detection.events
            if eid in events_by_id
        ],
    )
