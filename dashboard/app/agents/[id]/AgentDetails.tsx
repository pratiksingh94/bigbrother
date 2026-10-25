"use client"

import DashboardCard from "@/components/stats/DashboardCards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatLastSeen, formatNumber, formatRelative, statusBadge } from "@/lib/agent-utils"
import { getAgent, getAgentStats } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useQuery } from "@tanstack/react-query"
import { Activity, AlertTriangle, ArrowLeft, Clock, Cpu, Timer } from "lucide-react"
import Link from "next/link"

export default function AgentDetails({ id }: { id: string }) {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.agent(id),
        queryFn: () => getAgent(id),
        refetchInterval: 10000
    })

    const { data: stats } = useQuery({
        queryKey: queryKeys.agentStats(id),
        queryFn: () => getAgentStats(id)
    })

    // if(!data) notFound();
    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error</div>
    }

    if (!data) {
        return <div>no data? huh</div>
    }

    const windowLabel = stats ? `${stats.window_hours}h` : "24h"
    const cards = [
        { label: `Events (${windowLabel})`, value: stats ? formatNumber(stats.events) : undefined, icon: Activity },
        { label: `Detections (${windowLabel})`, value: stats ? formatNumber(stats.detections) : undefined, icon: AlertTriangle },
        { label: `Processes (${windowLabel})`, value: stats ? formatNumber(stats.processes) : undefined, icon: Cpu },
        { label: "Total Events", value: stats ? formatNumber(stats.total_events) : undefined, icon: Timer },
        { label: "Last Seen", value: formatRelative(data.last_seen), icon: Clock },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="link" asChild size="sm" className="px-0 text-muted-foreground">
                    <Link href="/agents">
                        <ArrowLeft className="mr-1 h-4 w-4"/>
                        Back to Agents
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{data.hostname}</h1>
                {statusBadge(data.status)}
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                {cards.map(s => (
                    <DashboardCard label={s.label} value={s.value} icon={s.icon} key={s.label}/>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-sm">System Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
                        <span className="text-muted-foreground">ID</span>
                        <span className="text-xs font-mono">{data.id}</span>

                        <span className="text-muted-foreground">IP Address</span>
                        <span className="text-xs font-mono">{data.ip_address}</span>

                        <span className="text-muted-foreground">Hostname</span>
                        <span>{data.hostname}</span>

                        <span className="text-muted-foreground">OS Name</span>
                        <span>{data.os_name}</span>

                        <span className="text-muted-foreground">Kernel</span>
                        <span className="text-xs font-mono">{data.kernel_version}</span>

                        <span className="text-muted-foreground">Status</span>
                        <span>{statusBadge(data.status)}</span>

                        <span className="text-muted-foreground">Registered</span>
                        <span>{formatLastSeen(data.registered_at)}</span>

                        <span className="text-muted-foreground">Last Seen</span>
                        <span>{formatLastSeen(data.last_seen)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}