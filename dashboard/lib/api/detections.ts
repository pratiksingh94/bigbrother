import { Detection, DetectionsResponse } from "../types";
import { apiUrl, errorMessage } from "./client";

export async function getDetections(): Promise<DetectionsResponse> {
    const res = await fetch(apiUrl("/detections"));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch detections"));

    return res.json();
}

export async function getDetection(id: number): Promise<Detection> {
    const res = await fetch(apiUrl(`/detections/${id}`));
    if (!res.ok) throw new Error(await errorMessage(res, "failed to fetch detection"));

    return res.json();
}

export async function updateDetectionStatus(id: number, status: string) {
    const res = await fetch(apiUrl(`/detections/${id}/status`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(await errorMessage(res, "failed to update detection status"));
}
