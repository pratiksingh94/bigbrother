from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator

ChannelKind = Literal["webhook", "slack", "discord"]
Severity = Literal["Low", "Medium", "High"]


def _check_url(value: str) -> str:
    value = value.strip()
    if not value:
        return value

    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("the url has to start with http:// or https://")

    return value


class AlertChannelFields(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    kind: ChannelKind
    enabled: bool = True
    min_severity: Severity = "Low"

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("the name cannot be empty")
        return value


class AlertChannelCreate(AlertChannelFields):
    url: str = Field(min_length=1, max_length=2000)

    @field_validator("url")
    @classmethod
    def check_url(cls, value: str) -> str:
        return _check_url(value)


class AlertChannelUpdate(AlertChannelFields):
    # An empty url keeps the one that is already stored.
    url: str = Field(default="", max_length=2000)

    @field_validator("url")
    @classmethod
    def check_url(cls, value: str) -> str:
        return _check_url(value)


class AlertChannelResponse(BaseModel):
    id: str
    name: str
    kind: str
    url_masked: str
    enabled: bool
    min_severity: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestResult(BaseModel):
    ok: bool
    error: str | None = None


class NotificationResponse(BaseModel):
    id: int
    detection_id: int
    channel_id: str
    channel_name: str
    status: str
    error: str | None
    attempts: int
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)
