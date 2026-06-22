export function severityBadgeClass(severity: string) {
    switch (severity.toLowerCase()) {
        case "high":
            return "border-destructive/30 bg-destructive/10 text-destructive"
        case "medium":
            return "border-warning/30 bg-warning/10 text-warning"
        case "low":
            return "border-border bg-muted text-muted-foreground"
        default:
            return "border-border bg-muted text-muted-foreground"
    }
}

export function statusBadgeClass(status: string) {
    switch (status.toLowerCase()) {
        case "open":
            return "capitalize border-destructive/30 bg-destructive/10 text-destructive"
        case "investigating":
            return "capitalize border-warning/30 bg-warning/10 text-warning"
        case "resolved":
            return "capitalize border-success/30 bg-success/10 text-success"
        case "false-positive":
            return "capitalize border-border bg-muted text-muted-foreground"
        default:
            return "capitalize border-border bg-muted text-muted-foreground"
    }
}