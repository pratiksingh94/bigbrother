import { Agent, AgentsResponse, EventsResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAgents(): Promise<AgentsResponse> {
    const res = await fetch(`${API_URL}/agents`)
    if(!res.ok) throw new Error("failed to fetch agents");

    return res.json()
}

export async function getAgent(id: string): Promise<Agent> {
    const res = await fetch(`${API_URL}/agents/${id}`)
    if(!res.ok) throw new Error("failed to fetch agent details");

    // console.log(await res.json())
    return res.json()
}

export async function getAgentEvents(id: string): Promise<EventsResponse> {
    const res = await fetch(`${API_URL}/agents/${id}/events`)
    if(!res.ok) throw new Error("failed to fetch events for agent");

    return res.json()
}

export async function getEvents(): Promise<EventsResponse> {
    const res = await fetch(`${API_URL}/events`)
    if(!res.ok) throw new Error("failed to fetch events");

    return res.json()
}