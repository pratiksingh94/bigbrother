from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import Dict, Any


class HostSummary(BaseModel):
    id: UUID
    hostname: str

    model_config = ConfigDict(from_attributes=True)

class LogSchema(BaseModel):
    source: str
    raw: str
    ingested_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventResponse(BaseModel):
    id: int
    host: HostSummary = Field(validation_alias="agent")
    log: LogSchema
    event_type: str
    context: Dict[str, Any] = Field(validation_alias="payload")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EventsResponse(BaseModel):
    events: list[EventResponse]

class EventsRequest(BaseModel):
    log: LogSchema
    event_type: str
    payload: Dict[str, Any]