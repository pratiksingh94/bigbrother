from typing import Any
from urllib.parse import urlparse

SEVERITY_ORDER = {"Low": 1, "Medium": 2, "High": 3}

SEVERITY_ICONS = {"High": "🔴", "Medium": "🟡", "Low": "⚪"}

DISCORD_COLORS = {"High": 0xED4245, "Medium": 0xF39C12, "Low": 0x95A5A6}
SLACK_COLORS = {"High": "#e01e5a", "Medium": "#e8a33d", "Low": "#8b949e"}


def build_payload(kind: str, summary: dict[str, Any]) -> dict[str, Any]:
    if kind == "slack":
        return _slack(summary)
    if kind == "discord":
        return _discord(summary)
    return _webhook(summary)


def mask_url(url: str) -> str:
    """Show where a url points without revealing the secret inside it.

    The secret of a webhook usually sits in the path, but it can also be part
    of the host, so the subdomain is hidden as well.
    """
    parsed = urlparse(url)
    if not parsed.netloc:
        return "••••"

    return f"{parsed.scheme}://{_mask_host(parsed.netloc)}/••••"


def _mask_host(netloc: str) -> str:
    host, _, port = netloc.rpartition(":")
    if not host:
        host, port = netloc, ""

    labels = host.split(".")
    masked = ".".join(["••••"] + labels[-2:]) if len(labels) > 1 else host

    return f"{masked}:{port}" if port else masked


def _webhook(summary: dict[str, Any]) -> dict[str, Any]:
    return {"source": "bigbrother", "type": "detection", **summary}


def _slack(summary: dict[str, Any]) -> dict[str, Any]:
    severity = summary["severity"]
    icon = SEVERITY_ICONS.get(severity, "")
    title = _truncate(f"{icon} {summary['rule']}", 150)

    return {
        "text": f"{icon} {summary['rule']} ({severity})",
        "blocks": [
            {"type": "header", "text": {"type": "plain_text", "text": title}},
            {"type": "section", "fields": _slack_fields(summary)},
            {"type": "section", "text": {"type": "mrkdwn", "text": _context_lines(summary)}},
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f"Detection \\#{summary['id']} • {summary['created_at']}"}
                ],
            },
        ],
    }


def _discord(summary: dict[str, Any]) -> dict[str, Any]:
    severity = summary["severity"]
    icon = SEVERITY_ICONS.get(severity, "")

    return {
        "username": "Big Brother",
        "content": f"{icon} {summary['rule']} ({severity})",
        "embeds": [
            {
                "title": _truncate(summary["rule"], 256),
                "description": _truncate(_context_lines(summary), 4096),
                "color": DISCORD_COLORS.get(severity, DISCORD_COLORS["Low"]),
                "fields": [
                    {"name": "Severity", "value": severity, "inline": True},
                    {"name": "Status", "value": summary["status"], "inline": True},
                    {"name": "Host", "value": _hosts(summary), "inline": True},
                    {"name": "Events", "value": _events(summary), "inline": True},
                ],
                "footer": {"text": f"Detection #{summary['id']}"},
                "timestamp": summary["created_at"],
            }
        ],
    }


def _slack_fields(summary: dict[str, Any]) -> list[dict[str, str]]:
    fields = [
        ("Severity", summary["severity"]),
        ("Status", summary["status"]),
        ("Host", _hosts(summary)),
        ("Events", _events(summary)),
    ]

    return [
        {"type": "mrkdwn", "text": f"*{label}*\n{_truncate(value, 2000)}"}
        for label, value in fields
    ]


def _context_lines(summary: dict[str, Any]) -> str:
    context = summary.get("context") or {}
    if not context:
        return "No context"

    return "\n".join(f"**{key}**: {value}" for key, value in context.items())


def _hosts(summary: dict[str, Any]) -> str:
    hosts = summary.get("hosts") or []
    return ", ".join(hosts) if hosts else "-"


def _events(summary: dict[str, Any]) -> str:
    types = ", ".join(summary.get("event_types") or []) or "-"
    return f"{summary.get('event_count', 0)} ({types})"


def _truncate(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    return value[: limit - 1] + "…"
