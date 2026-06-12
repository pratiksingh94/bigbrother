import { Event, EventsResponse } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatLastSeen } from "@/lib/agent-utils";
import { Badge } from "../ui/badge";
import { truncate } from "@/lib/event-utils";

export default function EventTable({ events, handleBadgeClick }: { events: Event[] | undefined, handleBadgeClick: (ev: string) => void; }) {
    return (
        <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Raw</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {events?.map(event => (
                <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatLastSeen(event.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                        {event.host.hostname}
                    </TableCell>
                    <TableCell>
                        <button onClick={() => handleBadgeClick(event.event_type)} className="cursor-pointer">
                            <Badge variant="secondary">{event.event_type}</Badge>
                        </button>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-md">
                        {truncate(event.log.raw)}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
    )
}