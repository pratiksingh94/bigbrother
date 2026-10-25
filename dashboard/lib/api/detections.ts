import { Detection, DetectionsResponse } from "../types";
import { errorMessage, request } from "./client";

export async function getDetections(): Promise<DetectionsResponse> {
    const res = await request("/detections");
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch detections"));

    return res.json();
}

export async function getDetection(id: number): Promise<Detection> {
    const res = await request(`/detections/${id}`);
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch detection"));

    return res.json();
}

export async function updateDetectionStatus(id: number, status: string) {
    const res = await request(`/detections/${id}/status`, {}, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to update detection status"));
}
