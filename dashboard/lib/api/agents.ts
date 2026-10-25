import { Agent, AgentsResponse, AgentStats, EventsResponse } from "../types";
import { errorMessage, request } from "./client";

export async function getAgents(): Promise<AgentsResponse> {
    const res = await request("/agents");
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch agents"));

    return res.json();
}

export async function getAgent(id: string): Promise<Agent> {
    const res = await request(`/agents/${id}`);
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch agent details"));

    return res.json();
}

export async function getAgentEvents(id: string): Promise<EventsResponse> {
    const res = await request(`/agents/${id}/events`);
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch events for agent"));

    return res.json();
}

export async function getAgentStats(id: string): Promise<AgentStats> {
    const res = await request(`/agents/${id}/stats`);
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch agent stats"));

    return res.json();
}
