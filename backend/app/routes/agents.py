from uuid import UUID
from fastapi import APIRouter, Request, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app.db import get_db
from app.models.agent import Agent
from app.models.event import Event
from app.models.log import Log
from app.utils.agents import get_presence
from app.schemas.agents import AgentHeartbeat, AgentsResponse, Agent as AgentResp
from app.schemas.events import EventsResponse, EventsRequest, EventResponse, LogSchema

router = APIRouter()


@router.get("", response_model=AgentsResponse)
async def get_agents(db: Session = Depends(get_db)):
    stmt = select(Agent)
    agents = db.scalars(stmt).all()
    
    return {
        "agents": [
            AgentResp(
                id=agent.id,
                hostname=agent.hostname,
                os_name=agent.os_name,
                kernel_version=agent.kernel_version,
                ip_address=agent.ip_address,
                registered_at=agent.registered_at,
                last_seen=agent.last_seen,
                status=get_presence(agent.last_seen)
            ) for agent in agents
        ]
    }



@router.post("/heartbeat")
async def agent_heartbeat(payload: AgentHeartbeat, req: Request, db: Session = Depends(get_db)):
    stmt = select(Agent).where(Agent.id == payload.id)
    agent = db.execute(stmt).scalar_one_or_none()

    if agent:
        agent.last_seen = datetime.now()
        agent.hostname = payload.hostname
        agent.os_name = payload.os_name
        agent.kernel_version = payload.kernel_version
        db.commit()
        return {"status": "ok"}
    else:
        new_agent = Agent(
            id=payload.id,
            hostname=payload.hostname,
            os_name=payload.os_name,
            kernel_version=payload.kernel_version,
            ip_address=req.client.host,
            status="online",
            registered_at=datetime.now(),
            last_seen=datetime.now()
        )

        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)

        return {"status": "ok"}


@router.get("/{id}", response_model=AgentResp)
async def agent_info(id: str, db: Session = Depends(get_db)):
    stmt = select(Agent).where(Agent.id == id)
    agent = db.execute(stmt).scalar_one_or_none()

    return agent


@router.post("/{id}/events")
async def createEvent(id: str, req_payload: EventsRequest, db: Session = Depends(get_db)):
    stmt = select(Agent).where(Agent.id == id)
    agent = db.execute(stmt).scalar_one_or_none()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    log_id = None
    if req_payload.log:
        new_log = Log(
            agent_id=id,
            source=req_payload.log.source,
            raw=req_payload.log.raw,
            ingested_at=req_payload.log.ingested_at
        )

        db.add(new_log)
        db.flush()
        log_id = new_log.id

    new_event = Event(
        agent_id=id,
        log_id=log_id,
        event_type=req_payload.event_type,
        payload=req_payload.payload
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {"status": "ok"}

@router.get("/{id}/events", response_model=EventsResponse)
async def getEvents(id: str, db: Session = Depends(get_db)):
    stmt = select(Agent).where(Agent.id == id)
    agent = db.execute(stmt).scalar_one_or_none()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    events_stmt = select(Event).where(Event.agent_id == id).options(joinedload(Event.agent)).order_by(Event.created_at.desc()).limit(100)
    events = db.scalars(events_stmt).all()
    return {
        "events": [
            EventResponse.model_validate(event) for event in events
        ]
    }