import { Agent, AgentsResponse, Detection, DetectionsResponse, Event, EventsResponse, Rule, RuleCreation, RulesResponse } from "./types";

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

export async function getEvent(id: number): Promise<Event> {
    const res = await fetch(`${API_URL}/events/${id}`);
    if(!res.ok) throw new Error("failed to fetch event");

    return res.json()
}

export async function getDetections(): Promise<DetectionsResponse> {
    const res = await fetch(`${API_URL}/detections`);
    if(!res.ok) throw new Error("failed to fetch detections");

    return res.json()
}

export async function getDetection(id: number): Promise<Detection> {
    const res = await fetch(`${API_URL}/detections/${id}`)
    if(!res.ok) throw new Error("failed to fetch detection");

    return res.json()
}

export async function getRules(): Promise<RulesResponse> {
    const res = await fetch(`${API_URL}/rules`)
    if(!res.ok) throw new Error("failed to fetch rules");

    return res.json()
}

export async function toggleRule(id: number) {
    const res = await fetch(`${API_URL}/rules/${id}/toggle`, {
        method: "PATCH"
    })

    if(!res.ok) throw new Error("failed to toggle rule");
}

export async function deleteRule(id: number) {
    const res = await fetch(`${API_URL}/rules/${id}`, {
        method: "DELETE"
    })

    if(!res.ok) throw new Error("failed to delete rule");
}

export async function createRule(rule: RuleCreation) {
    const res = await fetch(`${API_URL}/rules`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(rule)
    })

    if (!res.ok) throw new Error("failed to create rule");
}