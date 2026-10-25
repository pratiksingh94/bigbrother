import { Rule, RuleCreation } from "./types";

export type RuleType = "match" | "threshold";
export type Severity = "Low" | "Medium" | "High";

export interface RuleFormValues {
    name: string;
    rule_type: RuleType;
    event_type: string;
    severity: Severity;
    enabled: boolean;
    field: string;
    values: string;
    group_by: string;
    threshold: number;
    window_seconds: number;
}

export const emptyRuleForm = (): RuleFormValues => ({
    name: "",
    rule_type: "match",
    event_type: "",
    severity: "Medium",
    enabled: true,
    field: "",
    values: "",
    group_by: "",
    threshold: 5,
    window_seconds: 60,
});

export const ruleToForm = (rule: Rule): RuleFormValues => {
    const conditions = rule.conditions ?? {};

    return {
        name: rule.name,
        rule_type: rule.rule_type,
        event_type: rule.event_type,
        severity: rule.severity,
        enabled: rule.enabled,
        field: typeof conditions.field === "string" ? conditions.field : "",
        values: Array.isArray(conditions.in) ? conditions.in.join(", ") : "",
        group_by: typeof conditions.group_by === "string" ? conditions.group_by : "",
        threshold: typeof conditions.threshold === "number" ? conditions.threshold : 5,
        window_seconds:
            typeof conditions.window_seconds === "number" ? conditions.window_seconds : 60,
    };
};

export const formToRule = (form: RuleFormValues): RuleCreation => ({
    name: form.name,
    rule_type: form.rule_type,
    event_type: form.event_type,
    severity: form.severity,
    enabled: form.enabled,
    conditions:
        form.rule_type === "match"
            ? {
                field: form.field,
                in: form.values
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
            }
            : {
                group_by: form.group_by,
                threshold: form.threshold,
                window_seconds: form.window_seconds,
            },
});

export const describeRule = (form: RuleFormValues): string => {
    if (form.rule_type === "match") {
        const values = form.values
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);

        if (!form.field || values.length === 0) return "No conditions set";

        return `Fires on every ${form.event_type || "event"} where ${form.field} is one of "${values.join(", ")}"`;
    }

    if (!form.group_by) return "No conditions set";

    return `Fires when ${form.threshold} ${form.event_type || "events"} share the same ${form.group_by} within ${form.window_seconds} seconds`;
};
