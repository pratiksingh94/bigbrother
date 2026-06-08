"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getAgents } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AgentsResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Monitor } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


// i will put these in some file later
const statusBadge = (status: string) => {
    switch(status) {
        case "online":
            return <Badge variant="default">online</Badge>
        case "offline":
            return <Badge variant="destructive">offline</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

const formatLastSeen = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}


export default function AgentsPage() {
    
    const {data} = useQuery({
        queryKey: queryKeys.agents,
        queryFn: getAgents,
        refetchInterval: 100000
    })
    
    // const [agents, setAgents] = useState<AgentsResponse>(agents);
    // setAgents(data)


    const totalCount = data?.agents.length;
    const onlineCount = data?.agents.filter(a => a.status === "online").length

    return (
        <div className="flex flex-col gap-6">

            {data == null || totalCount === 0 ? (
                <div className="flex flex-col py-20 items-center gap-3">
                    <Monitor className="h-12 w-12 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">No agents found.</p>
                </div>
            ) : (
                <>
                <p className="font-semibold text-2xl">{onlineCount} of {totalCount} agents online</p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Hostname</TableHead>
                            <TableHead>OS</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Seen</TableHead>
                            <TableHead>Monitor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.agents.map(a => (
                            <TableRow key={a.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p>{a.id.slice(0,8)}</p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{a.id}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>

                                <TableCell className="text-xs font-mono">
                                    {a.ip_address}
                                </TableCell>

                                <TableCell className="font-medium">
                                    {a.hostname}
                                </TableCell>

                                <TableCell className="text-muted-foreground">
                                    {a.os_name}
                                </TableCell>

                                <TableCell>{statusBadge(a.status)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatLastSeen(a.last_seen)}
                                </TableCell>

                                <TableCell>
                                    <Button variant="default" size="sm" asChild>
                                        <Link href={`/agents/${a.id}`}>Monitor</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </>
            )}
        </div>
    )
}