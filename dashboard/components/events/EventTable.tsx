"use client"

import { Event, EventsResponse } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatLastSeen } from "@/lib/agent-utils";
import { Badge } from "../ui/badge";
import { truncate } from "@/lib/event-utils";
import { useState } from "react";
import { EventSheet } from "./EventSheet";

export default function EventTable({ events, handleBadgeClick }: { events: Event[] | undefined, handleBadgeClick: (ev: string) => void; }) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    return (
        <>
        <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Raw</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {events?.map(event => (
                <TableRow key={event.id} onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatLastSeen(event.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                        {event.host.hostname}
                    </TableCell>
                    <TableCell>
                        <button onClick={(e) => {
                            e.stopPropagation()
                            handleBadgeClick(event.event_type)
                        }} 
                        className="cursor-pointer">
                            <Badge variant="secondary">{event.event_type}</Badge>
                        </button>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(event.context).slice(0, 2).map(([k, v]) => (
                                <span key={k} className="font-mono text-xs text-muted-foreground">
                                    <span className="text-foreground">{k}</span>={truncate(String(v), 20)}
                                </span>
                            ))}
                            {Object.keys(event.context).length > 2 && (
                                <span className="text-xs text-muted-foreground">+{Object.keys(event.context).length - 2} more</span>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-md">
                        {event.log ? truncate(event.log.raw) : "no logs"}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>

    {selectedEvent && (
        <EventSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => { if(!open) setSelectedEvent(null) }}
        />
    )}
        </>
    )
}