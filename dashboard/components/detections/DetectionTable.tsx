"use client"

import { Detection, DetectionsResponse } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatLastSeen } from "@/lib/agent-utils";
import { Badge } from "../ui/badge";
import { severityBadgeClass } from "@/lib/detections-utils";
import { useRouter } from "next/navigation";


export default function DetectionTable({ detections }: { detections: Detection[] }) {
    const router = useRouter()
    const redirectToDetails = (id: number) => {
        router.push(`/detections/${id}`)
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {detections.map(d => (
                    <TableRow key={d.id} onClick={() => redirectToDetails(d.id)} className="cursor-pointer">
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatLastSeen(d.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">{d.rule_name}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{d.triggering_events[0].event_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{d.triggering_events[0].host.hostname}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={severityBadgeClass(d.severity)}>{d.severity}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="capitalize">{d.status}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}