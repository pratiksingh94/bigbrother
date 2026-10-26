import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.alerts.dispatcher import send_test
from app.alerts.formats import mask_url
from app.db import get_db
from app.models.alert_channel import AlertChannel
from app.models.notification import Notification
from app.schemas.alerts import (
    AlertChannelCreate,
    AlertChannelResponse,
    AlertChannelUpdate,
    NotificationResponse,
    TestResult,
)

router = APIRouter()


@router.get("", response_model=list[AlertChannelResponse])
def list_channels(db: Session = Depends(get_db)):
    channels = db.scalars(
        select(AlertChannel).order_by(AlertChannel.created_at.desc())
    ).all()

    return [_to_response(channel) for channel in channels]


@router.post("", response_model=AlertChannelResponse)
def create_channel(req: AlertChannelCreate, db: Session = Depends(get_db)):
    channel = AlertChannel(
        id=str(uuid.uuid4()),
        name=req.name,
        kind=req.kind,
        url=req.url,
        enabled=req.enabled,
        min_severity=req.min_severity,
    )

    db.add(channel)
    db.commit()
    db.refresh(channel)

    return _to_response(channel)


@router.patch("/{id}", response_model=AlertChannelResponse)
def update_channel(id: str, req: AlertChannelUpdate, db: Session = Depends(get_db)):
    channel = db.get(AlertChannel, id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    channel.name = req.name
    channel.kind = req.kind
    channel.enabled = req.enabled
    channel.min_severity = req.min_severity

    if req.url.strip():
        channel.url = req.url.strip()

    db.commit()
    db.refresh(channel)

    return _to_response(channel)


@router.delete("/{id}")
def delete_channel(id: str, db: Session = Depends(get_db)):
    channel = db.get(AlertChannel, id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    db.execute(delete(Notification).where(Notification.channel_id == id))
    db.delete(channel)
    db.commit()

    return {"status": "ok"}


@router.post("/{id}/test", response_model=TestResult)
def test_channel(id: str, db: Session = Depends(get_db)):
    channel = db.get(AlertChannel, id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    error = send_test(channel)

    return TestResult(ok=error is None, error=error)


@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Notification).order_by(Notification.sent_at.desc()).limit(50)
    ).all()

    return [NotificationResponse.model_validate(row) for row in rows]


def _to_response(channel: AlertChannel) -> AlertChannelResponse:
    return AlertChannelResponse(
        id=channel.id,
        name=channel.name,
        kind=channel.kind,
        url_masked=mask_url(channel.url),
        enabled=channel.enabled,
        min_severity=channel.min_severity,
        created_at=channel.created_at,
    )
