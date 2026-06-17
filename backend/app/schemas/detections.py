from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Dict, Any

from app.schemas.events import EventResponse


class DetectionResponse(BaseModel):
    id: int
    rule_name: str
    status: str
    severity: str
    triggering_events: list[EventResponse]
    context: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DetectionsResponse(BaseModel):
    detections: list[DetectionResponse]