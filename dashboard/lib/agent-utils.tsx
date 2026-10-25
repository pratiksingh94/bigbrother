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

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)

export const formatRelative = (iso: string) => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))

    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`
    return `${Math.floor(hours / 24)}d ago`
}
