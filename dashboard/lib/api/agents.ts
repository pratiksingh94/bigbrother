import { Agent, AgentsResponse, EventsResponse } from "../types";
import { apiUrl, errorMessage } from "./client";

export async function getAgents(): Promise<AgentsResponse> {
    const res = await fetch(apiUrl("/agents"));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch agents"));

    return res.json();
}

export async function getAgent(id: string): Promise<Agent> {
    const res = await fetch(apiUrl(`/agents/${id}`));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch agent details"));

    return res.json();
}

export async function getAgentEvents(id: string): Promise<EventsResponse> {
    const res = await fetch(apiUrl(`/agents/${id}/events`));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch events for agent"));

    return res.json();
}
