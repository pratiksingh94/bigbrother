from app.db import Base
from sqlalchemy import ForeignKey, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

class Log(Base):
    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    agent_id: Mapped[str] = mapped_column(ForeignKey("agents.id"))
    agent: Mapped["Agent"] = relationship(back_populates="logs")
    source: Mapped[str] = mapped_column(String())
    raw: Mapped[str] = mapped_column(Text())
    ingested_at: Mapped[datetime] = mapped_column(DateTime(), server_default=func.now())