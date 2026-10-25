from datetime import datetime, timedelta, timezone

from sqlalchemy import Integer, cast, distinct, exists, func, select
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.detection import Detection
from app.models.event import Event
from app.schemas.agents import AgentStats

WINDOW_HOURS = 24


def collect_agent_stats(
    db: Session, agent: Agent, window_hours: int = WINDOW_HOURS
) -> AgentStats:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)

    return AgentStats(
        events=_count_events(db, agent.id, cutoff),
        detections=_count_detections(db, agent.id, cutoff),
        processes=_count_process_events(db, agent.id, cutoff),
        window_hours=window_hours,
        total_events=_count_events(db, agent.id, None),
    )


def _count_events(db: Session, agent_id: str, cutoff: datetime | None) -> int:
    stmt = select(func.count(Event.id)).where(Event.agent_id == agent_id)
    if cutoff is not None:
        stmt = stmt.where(Event.created_at >= cutoff)

    return db.scalar(stmt) or 0


def _count_process_events(db: Session, agent_id: str, cutoff: datetime | None) -> int:
    stmt = select(func.count(Event.id)).where(
        Event.agent_id == agent_id,
        Event.event_type == "process.creation",
    )
    if cutoff is not None:
        stmt = stmt.where(Event.created_at >= cutoff)

    return db.scalar(stmt) or 0


def _count_detections(db: Session, agent_id: str, cutoff: datetime | None) -> int:
    event_ids = select(Event.id).where(Event.agent_id == agent_id)
    if cutoff is not None:
        event_ids = event_ids.where(Event.created_at >= cutoff)

    elements = func.jsonb_array_elements_text(Detection.events).table_valued("value")
    triggered_by_agent = exists(
        select(1)
        .select_from(elements)
        .where(cast(elements.c[0], Integer).in_(event_ids))
    )

    stmt = select(func.count(distinct(Detection.id))).where(triggered_by_agent)
    if cutoff is not None:
        stmt = stmt.where(Detection.created_at >= cutoff)

    return db.scalar(stmt) or 0
