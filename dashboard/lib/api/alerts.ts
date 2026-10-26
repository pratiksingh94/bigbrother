import { AlertChannel, AlertChannelInput, AlertNotification, AlertTestResult } from "../types";
import { errorMessage, request } from "./client";

export async function getAlertChannels(): Promise<AlertChannel[]> {
    const res = await request("/alerts");
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch alert channels"));

    return res.json();
}

export async function createAlertChannel(channel: AlertChannelInput): Promise<AlertChannel> {
    const res = await request("/alerts", {}, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(channel)
    });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to create alert channel"));

    return res.json();
}

export async function updateAlertChannel(id: string, channel: AlertChannelInput): Promise<AlertChannel> {
    const res = await request(`/alerts/${id}`, {}, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(channel)
    });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to update alert channel"));

    return res.json();
}

export async function deleteAlertChannel(id: string): Promise<void> {
    const res = await request(`/alerts/${id}`, {}, { method: "DELETE" });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to delete alert channel"));
}

export async function testAlertChannel(id: string): Promise<AlertTestResult> {
    const res = await request(`/alerts/${id}/test`, {}, { method: "POST" });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to test alert channel"));

    return res.json();
}

export async function getAlertNotifications(): Promise<AlertNotification[]> {
    const res = await request("/alerts/notifications");
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch alert notifications"));

    return res.json();
}
