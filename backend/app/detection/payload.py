from typing import Any

# ar ar ar
def lookup(payload: dict[str, Any], field: str) -> Any:
    if field in payload:
        return payload[field]

    lowered = field.lower()
    for key, value in payload.items():
        if key.lower() == lowered:
            return value

    return None
