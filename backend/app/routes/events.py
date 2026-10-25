from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.event import Event
from app.schemas.events import EventResponse, EventsResponse

router = APIRouter()

MAX_LIMIT = 500


@router.get("", response_model=EventsResponse)
async def get_events(
    db: Session = Depends(get_db),
    agent_id: str | None = None,
    event_type: str | None = None,
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
):
    stmt = (
        select(Event)
        .options(joinedload(Event.agent), joinedload(Event.log))
        .order_by(Event.created_at.desc())
    )

    if agent_id:
        stmt = stmt.where(Event.agent_id == agent_id)
    if event_type:
        stmt = stmt.where(Event.event_type.ilike(_like_pattern(event_type), escape="\\"))

    stmt = stmt.limit(limit).offset(offset)

    events = db.scalars(stmt).all()

    return {
        "events": [
            EventResponse.model_validate(event) for event in events
        ]
    }


@router.get("/{id}")
async def get_event(id: int, db: Session = Depends(get_db)):
    stmt = select(Event).where(Event.id == id)
    ev = db.execute(stmt).scalar_one_or_none()

    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    return ev


def _like_pattern(term: str) -> str:
    escaped = (
        term.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )
    return f"%{escaped}%"
