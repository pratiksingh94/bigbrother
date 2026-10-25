from datetime import datetime
from typing import Any, Dict, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator


class MatchConditions(BaseModel):
    """Conditions for a `match` rule.

    Fires when a payload field of the event equals one of `values`.
    """

    model_config = ConfigDict(extra="forbid")

    field: str = Field(min_length=1)
    values: list[str] = Field(min_length=1, alias="in")


class ThresholdConditions(BaseModel):
    """Conditions for a `threshold` rule.

    Fires when at least `threshold` events share the same `group_by` value
    inside a `window_seconds` window.
    """

    model_config = ConfigDict(extra="forbid")

    group_by: str = Field(min_length=1)
    threshold: int = Field(ge=1)
    window_seconds: int = Field(ge=1)


RuleConditions = MatchConditions | ThresholdConditions

# Which conditions model belongs to which rule type. The API and the engine
# both use this, so a rule can never be stored with the wrong condition shape.
CONDITIONS_BY_RULE_TYPE: Dict[str, type] = {
    "match": MatchConditions,
    "threshold": ThresholdConditions,
}


def describe_validation_error(exc: ValidationError) -> str:
    """Render a validation error as a single readable sentence."""
    return ", ".join(
        f"{'.'.join(str(part) for part in error['loc']) or 'conditions'}: {error['msg']}"
        for error in exc.errors()
    )


class RuleRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    rule_type: Literal["match", "threshold"]
    event_type: str = Field(min_length=1)
    conditions: RuleConditions
    severity: Literal["Low", "Medium", "High"]
    enabled: bool = True

    @model_validator(mode="before")
    @classmethod
    def validate_conditions(cls, data: Any) -> Any:
        """Check the conditions against the model of the declared rule type.

        Doing this before the union is resolved keeps the error message about
        the fields that this rule type actually uses, instead of listing the
        requirements of every possible condition shape.
        """
        if not isinstance(data, dict):
            return data

        rule_type = data.get("rule_type")
        conditions = data.get("conditions")
        model = CONDITIONS_BY_RULE_TYPE.get(rule_type)

        if model is None or not isinstance(conditions, dict):
            return data

        try:
            validated = model.model_validate(conditions)
        except ValidationError as exc:
            raise ValueError(
                f"invalid conditions for a '{rule_type}' rule: "
                f"{describe_validation_error(exc)}"
            ) from exc

        return {**data, "conditions": validated}

    @model_validator(mode="after")
    def conditions_match_rule_type(self) -> "RuleRequest":
        expected = CONDITIONS_BY_RULE_TYPE[self.rule_type]
        if not isinstance(self.conditions, expected):
            raise ValueError(
                f"rule_type '{self.rule_type}' requires "
                f"{expected.__name__} conditions, got {type(self.conditions).__name__}"
            )
        return self


class RuleResponse(BaseModel):
    id: int
    name: str
    rule_type: str
    event_type: str
    conditions: Dict[str, Any]
    severity: str
    enabled: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RulesResponse(BaseModel):
    rules: list[RuleResponse]
