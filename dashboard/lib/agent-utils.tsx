import { Badge } from "@/components/ui/badge"

export const statusBadge = (status: string) => {
    switch(status) {
        case "online":
            return <Badge variant="default">online</Badge>
        case "offline":
            return <Badge variant="destructive">offline</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export const formatLastSeen = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}
