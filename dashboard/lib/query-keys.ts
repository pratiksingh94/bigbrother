export const queryKeys = {
    agents: ["agents"],
    agent: (id: string) => ["agent", id],
    agentEvents: (id: string) => ["agent", id, "events"],
    agentStats: (id: string) => ["agent", id, "stats"],

    events: ["events"],
    event: (id: number) => ["event", id],

    detections: ["detections"],
    detection: (id: number) => ["detections", id],

    rules: ["rules"],
    rule: (id: number) => ["rule", id],

    alertChannels: ["alertChannels"],
    alertNotifications: ["alertNotifications"]
}