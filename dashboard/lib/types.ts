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

export interface AgentStats {
    events: number;
    detections: number;
    processes: number;
    window_hours: number;
    total_events: number;
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

export type Severity = "Low" | "Medium" | "High";

export type AlertChannelKind = "webhook" | "slack" | "discord";

export interface AlertChannel {
    id: string;
    name: string;
    kind: AlertChannelKind;
    /** The url with its secret hidden, the real one is never sent out. */
    url_masked: string;
    enabled: boolean;
    min_severity: Severity;
    created_at: string;
}

export interface AlertChannelInput {
    name: string;
    kind: AlertChannelKind;
    url: string;
    enabled: boolean;
    min_severity: Severity;
}

export interface AlertNotification {
    id: number;
    detection_id: number;
    channel_id: string;
    channel_name: string;
    status: string;
    error: string | null;
    attempts: number;
    sent_at: string;
}

export interface AlertTestResult {
    ok: boolean;
    error: string | null;
}
export interface RuleCreation {
    name: string;
    rule_type: "match" | "threshold";
    event_type: string;
    conditions: Record<string, unknown>;
    severity: "Low" | "Medium" | "High";
    enabled?: boolean;
}