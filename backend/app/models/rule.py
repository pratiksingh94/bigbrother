from app.db import Base

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Dict

class Rule(Base):
    __tablename__ = "rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    rule_type: Mapped[str]
    event_type: Mapped[str]
    conditions: Mapped[Dict] = mapped_column(JSONB)
    severity: Mapped[str]
    enabled: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())