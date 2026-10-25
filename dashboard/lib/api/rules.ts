import { Rule, RuleCreation, RulesResponse } from "../types";
import { apiUrl, errorMessage } from "./client";

export async function getRules(): Promise<RulesResponse> {
    const res = await fetch(apiUrl("/rules"));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch rules"));

    return res.json();
}

export async function createRule(rule: RuleCreation) {
    const res = await fetch(apiUrl("/rules"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(rule)
    });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to create rule"));
}

export async function toggleRule(id: number) {
    const res = await fetch(apiUrl(`/rules/${id}/toggle`), {
        method: "PATCH"
    });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to toggle rule"));
}

export async function deleteRule(id: number) {
    const res = await fetch(apiUrl(`/rules/${id}`), {
        method: "DELETE"
    });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to delete rule"));
}
