from app.db import Base
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import List, Dict

class Detection(Base):
    __tablename__ = "detections"
    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str]
    severity: Mapped[str]
    events: Mapped[List[int]] = mapped_column(JSONB)
    context: Mapped[Dict] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(default="open")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())