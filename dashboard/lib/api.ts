import { Agent, AgentsResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAgents(): Promise<AgentsResponse> {
    const res = await fetch(`${API_URL}/agents`)
    if(!res.ok) throw new Error("failed to fetch agents");

    return res.json()
}