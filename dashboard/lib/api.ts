import { Agent, AgentsResponse, Detection, DetectionsResponse, Event, EventsResponse } from "./types";

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