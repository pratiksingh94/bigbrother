"use client"

import EventTable from "@/components/events/EventTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatLastSeen } from "@/lib/agent-utils"
import { getDetection } from "@/lib/api"
import { severityBadgeClass } from "@/lib/detections-utils"
import { queryKeys } from "@/lib/query-keys"
import { useQuery } from "@tanstack/react-query"
import { kMaxLength } from "buffer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DetectionDetails({ id }: { id: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.detection(id),
        queryFn: () => getDetection(id)
    })

    if(isLoading) return <div>loading...</div>
    if(error) return <div>error lmao</div>
    if(!data) return <div>hell nah how no data</div>

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="link" asChild size="sm" className="px-0 text-muted-foreground">
                    <Link href="/detections">
                        <ArrowLeft className="mr-1 h-4 w-4"/>
                        Back to Detections
                    </Link>
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">{data?.rule_name}</h1>
                    <p className="text-sm text-muted-foreground">Detection #{data?.id} - {formatLastSeen(data?.created_at as string)}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={severityBadgeClass(data?.severity)}>{data.severity}</Badge>
                    <Badge variant="secondary" className="capitalize">{data.status}</Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Context</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {Object.entries(data.context).map(([k, v]) => (
                        <div key={k} className="flex text-sm gap-2">
                            <span className="font-mono text-muted-foreground">{k}:</span>
                            <span className="font-mono">{String(v)}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Triggered Events ({data.triggering_events.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EventTable events={data.triggering_events}/>
                </CardContent>
            </Card>
        </div>
    )
}