import uuid
from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import get_db
from app.models.agent import Agent



router = APIRouter()




@router.get("")
async def get_agents(db: Session = Depends(get_db)):
    stmt = select(Agent)
    agents = db.scalars(stmt).all()
    return {"agents": agents}








class AgentHeartbeat(BaseModel):
    id: str
    hostname: str
    os_name: str
    # os_version: str
    kernel_version: str

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