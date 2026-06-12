from datetime import datetime
from app.db import Base
from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    hostname = Column(String, nullable=False)
    os_name = Column(String)
    # os_version = Column(String)
    kernel_version = Column(String)
    ip_address = Column(String, nullable=False)
    status = Column(String, nullable=False)
    registered_at = Column(DateTime, nullable=False, default=datetime.now)
    last_seen = Column(DateTime, nullable=False, default=datetime.now)

    events: Mapped[list["Event"]] = relationship(back_populates="agent")
    logs: Mapped[list["Log"]] = relationship(back_populates="agent")
