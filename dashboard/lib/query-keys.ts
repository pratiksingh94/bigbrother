export const queryKeys = {
    agents: ["agents"],
    agent: (id: string) => ["agent", id],
    agentEvents: (id: string) => ["agent", id, "events"],
    events: ["events"]
}