import { Event, EventsResponse } from "../types";
import { apiUrl, errorMessage } from "./client";

export interface EventFilters {
    limit?: number;
    agent_id?: string;
    event_type?: string;
}

export async function getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
    const res = await fetch(apiUrl("/events", {
        limit: filters.limit,
        agent_id: filters.agent_id,
        event_type: filters.event_type,
    }));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch events"));

    return res.json();
}

export async function getEvent(id: number): Promise<Event> {
    const res = await fetch(apiUrl(`/events/${id}`));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch event"));

    return res.json();
}
