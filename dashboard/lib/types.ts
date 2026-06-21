export interface Agent {
    id: string;
    hostname: string;
    os_name: string;
    kernel_version: string;
    status: string;
    ip_address: string;
    registered_at: string;
    last_seen: string;
}

export interface AgentsResponse {
    agents: Agent[]
}


export interface Event {
    id: number;
    host: {
        id: string;
        hostname: string;
    };
    log: {
        source: string;
        raw: string;
        ingested_at: string;
    };
    event_type: string;
    context: Record<string, unknown>;
    created_at: string;
}

export interface EventsResponse {
    events: Event[]
}



export interface Detection {
    id: number;
    rule_name: string;
    status: string;
    severity: string;
    triggering_events: Event[]
    context: Record<string, unknown>;
    created_at: string;
}

export interface DetectionsResponse {
    detections: Detection[]
}





export interface Rule {
    id: number;
    name: string;
    rule_type: "match" | "threshold";
    event_type: string;
    conditions: Record<string, unknown>;
    severity: "Low" | "Medium" | "High";
    enabled: boolean;
    created_at: string;
}
export interface RulesResponse {
    rules: Rule[]
}
export interface RuleCreation {
    name: string;
    rule_type: "match" | "threshold";
    event_type: string;
    conditions: Record<string, unknown>;
    severity: "Low" | "Medium" | "High";
}