from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Agent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    hostname: str
    os_name: str
    kernel_version: str
    ip_address: str
    registered_at: datetime
    last_seen: datetime
    status: str


class AgentsResponse(BaseModel):
    agents: list[Agent]

class AgentHeartbeat(BaseModel):
    id: str
    hostname: str
    os_name: str
    kernel_version: str


class AgentStats(BaseModel):
    events: int
    detections: int
    processes: int
    window_hours: int
    total_events: int