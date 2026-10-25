const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type QueryValue = string | number | undefined;


export function apiUrl(path: string, params: Record<string, QueryValue> = {}): string {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === "") continue;
        query.set(key, String(value));
    }

    const search = query.toString();
    return `${API_URL}${path}${search ? `?${search}` : ""}`;
}

export async function request(
    path: string,
    params: Record<string, QueryValue> = {},
    init?: RequestInit
): Promise<Response> {
    return fetch(apiUrl(path, params), { cache: "no-store", ...init });
}


export async function errorMessage(res: Response, fallback: string): Promise<string> {
    try {
        const body = await res.json();
        const detail = body?.detail;

        if (typeof detail === "string") return detail;
        if (Array.isArray(detail)) {
            return detail.map((d) => d?.msg ?? JSON.stringify(d)).join(", ");
        }
    } catch {
    }

    return fallback;
}
