from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select


from app.db import get_db
from app.schemas.events import EventResponse, EventsResponse
from app.models.event import Event

router = APIRouter()

@router.get("", response_model=EventsResponse)
async def get_events(
    db: Session = Depends(get_db),
    agent_id: str | None = None,
    event_type: str | None = None,
    limit: int = 50,
    offset: int = 0
):
    stmt = select(Event).options(joinedload(Event.agent), joinedload(Event.log)).order_by(Event.created_at.desc())

    if agent_id:
        stmt = stmt.where(Event.agent_id == agent_id)
    if event_type:
        stmt = stmt.where(Event.event_type == event_type)

    stmt = stmt.limit(limit).offset(offset)
    
    events = db.scalars(stmt).all()

    return {
        "events": [
            EventResponse.model_validate(event) for event in events
        ]
    }

@router.get("/{id}")
async def get_event(id: int,db: Session = Depends(get_db)):
    stmt = select(Event).where(Event.id == id)
    ev = db.execute(stmt).scalar_one_or_none()

    return ev
