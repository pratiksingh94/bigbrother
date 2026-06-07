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