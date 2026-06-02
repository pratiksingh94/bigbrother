import uuid
from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.agent import Agent



router = APIRouter()

class AgentRegistration(BaseModel):
    hostname: str
    os_name: str
    os_version: str


@router.post("/register")
async def register_agent(agent: AgentRegistration, req: Request, db: Session = Depends(get_db)):
    agent_id = uuid.uuid4()
    
    agent = Agent(
        id=agent_id,
        hostname=agent.hostname,
        os_name=agent.os_name,
        os_version=agent.os_version,
        ip_address=req.client.host,
        status="active",
        registered_at=datetime.now(),
        last_seen=datetime.now()
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return {"agent_id": str(agent.id)}
