export function severityBadgeClass(severity: string) {
    switch (severity.toLowerCase()) {
        case "high":
            return "border-destructive/30 bg-destructive/10 text-destructive"
        case "medium":
            return "border-warning/30 border-warning/10 text-warning"
        case "low":
            return "border-border bg-muted text-muted-foreground"
        default:
            return "border-border bg-muted text-muted-foreground"
    }
}