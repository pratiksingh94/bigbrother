from datetime import datetime, timezone


def as_utc(value: datetime) -> datetime:
    """Read a timestamp without a timezone as utc.

    The server stores its timestamps in utc, but a few columns are not
    timezone aware, so they need it added before they are sent out.
    """
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def get_presence(last_seen):
    delta = datetime.now(timezone.utc) - as_utc(last_seen)

    if delta.total_seconds() < 120:
        return "online"

    return "offline"
