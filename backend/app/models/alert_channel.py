from datetime import datetime

from app.db import Base
from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column


class AlertChannel(Base):
    __tablename__ = "alert_channels"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    kind: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    min_severity: Mapped[str] = mapped_column(String, nullable=False, default="Low")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
