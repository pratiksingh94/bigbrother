from app.db import Base
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from typing import Dict, Any, Optional

class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    agent: Mapped["Agent"] = relationship(back_populates="events")
    log_id: Mapped[int | None] = mapped_column(ForeignKey("logs.id"), nullable=True)
    log: Mapped[Optional["Log"]] = relationship()
    event_type: Mapped[str] = mapped_column(String())
    payload: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())