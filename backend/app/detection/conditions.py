from pydantic import BaseModel, ValidationError

from app.models.rule import Rule
from app.schemas.rules import MatchConditions, ThresholdConditions


class InvalidRuleConditions(Exception):
    """raised when a stored rule's conditions do not match its rule type."""


def match_conditions(rule: Rule) -> MatchConditions:
    """Return the validated conditions of a `match` rule."""
    return _validate(rule, MatchConditions)


def threshold_conditions(rule: Rule) -> ThresholdConditions:
    """Return the validated conditions of a `threshold` rule."""
    return _validate(rule, ThresholdConditions)


def _validate(rule: Rule, model: type[BaseModel]) -> BaseModel:
    try:
        return model.model_validate(rule.conditions)
    except ValidationError as exc:
        raise InvalidRuleConditions(
            f"rule {rule.id} ({rule.name!r}) has invalid {model.__name__}: {exc}"
        ) from exc
