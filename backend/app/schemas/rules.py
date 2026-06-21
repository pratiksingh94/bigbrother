from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Dict, Any, Literal

class RuleResponse(BaseModel):
    id: int
    name: str
    rule_type: str
    event_type: str
    conditions: Dict[str, Any]
    severity: str
    enabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RulesResponse(BaseModel):
    rules: list[RuleResponse]

class RuleRequest(BaseModel):
    name: str
    rule_type: Literal["match", "threshold"]
    event_type: str
    conditions: Dict[str, Any]
    severity: Literal["Low", "Medium", "High"]
    enabled: bool = True