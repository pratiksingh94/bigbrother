import { Rule, RuleCreation, RulesResponse } from "../types";
import { errorMessage, request } from "./client";

export async function getRules(): Promise<RulesResponse> {
    const res = await request("/rules");
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch rules"));

    return res.json();
}

export async function getRule(id: number): Promise<Rule> {
    const res = await request(`/rules/${id}`);
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch rule"));

    return res.json();
}

export async function createRule(rule: RuleCreation) {
    const res = await request("/rules", {}, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(rule)
    });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to create rule"));
}

export async function updateRule(id: number, rule: RuleCreation) {
    const res = await request(`/rules/${id}`, {}, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(rule)
    });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to update rule"));
}

export async function toggleRule(id: number) {
    const res = await request(`/rules/${id}/toggle`, {}, { method: "PATCH" });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to toggle rule"));
}

export async function deleteRule(id: number) {
    const res = await request(`/rules/${id}`, {}, { method: "DELETE" });

    if (!res.ok) throw new Error(await errorMessage(res, "failed to delete rule"));
}
