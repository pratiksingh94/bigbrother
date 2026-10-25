"use client"

import EventTable from "@/components/events/EventTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAgents, getEvents } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { useCallback, useState } from "react";

// A select item cannot have an empty value, so the "all agents" option needs
// a sentinel of its own instead of an empty string.
const ALL_AGENTS = "__all__";

const DEFAULT_LIMIT = 50;

interface Filters {
    agentId: string;
    type: string;
    limit: number;
}

const DEFAULT_FILTERS: Filters = { agentId: "", type: "", limit: DEFAULT_LIMIT };

export default function EventsPage() {
    // Draft values, only sent to the backend once they are applied.
    const [agentFilter, setAgentFilter] = useState(ALL_AGENTS);
    const [typeFilter, setTypeFilter] = useState("");
    const [limit, setLimit] = useState(String(DEFAULT_LIMIT));
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

    const applyFilters = useCallback(() => {
        const parsed = parseInt(limit, 10);

        setFilters({
            agentId: agentFilter === ALL_AGENTS ? "" : agentFilter,
            type: typeFilter.trim(),
            limit: Number.isNaN(parsed) || parsed < 1 ? DEFAULT_LIMIT : parsed,
        });
    }, [agentFilter, typeFilter, limit]);

    const clearFilters = useCallback(() => {
        setAgentFilter(ALL_AGENTS);
        setTypeFilter("");
        setLimit(String(DEFAULT_LIMIT));
        setFilters(DEFAULT_FILTERS);
    }, []);

    const { data, isLoading, error } = useQuery({
        queryKey: [...queryKeys.events, filters],
        queryFn: () => getEvents({
            limit: filters.limit,
            agent_id: filters.agentId || undefined,
            event_type: filters.type || undefined,
        }),
        refetchInterval: 10000
    })

    const { data: hosts } = useQuery({
        queryKey: queryKeys.agents,
        queryFn: getAgents,
        refetchInterval: 60000
    })

    // Clicking a type badge filters by that type right away.
    const handleBadgeClick = useCallback((eventType: string) => {
        setTypeFilter(eventType);
        setFilters(prev => ({ ...prev, type: eventType }));
    }, [])

    const events = data?.events ?? []

    if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>
    if (error) return <div className="text-sm text-destructive">Failed to load events.</div>

    return (
        <div className="flex flex-col gap-6">
            <p className="text-2xl font-semibold">Events Feed</p>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Agent</span>

                    <Select value={agentFilter} onValueChange={setAgentFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All Hosts"/>
                        </SelectTrigger>
                        <SelectContent className="p-2">
                            <SelectItem value={ALL_AGENTS} className="cursor-pointer">All Agents</SelectItem>
                            {hosts?.agents.map(h => (
                                <SelectItem key={h.id} value={h.id} className="cursor-pointer">{h.hostname}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>


                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Event Type</span>
                    <Input
                    placeholder="Filter by type..."
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-48"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Limit</span>
                    <Input
                    type="number"
                    min={1}
                    placeholder={String(DEFAULT_LIMIT)}
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="w-24"
                    />
                </div>


                <Button variant="default" onClick={applyFilters} className="cursor-pointer">Apply</Button>
                <Button variant="outline" onClick={clearFilters} className="cursor-pointer">Clear</Button>
            </div>

            {events.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20">
                    <Activity className="h-12 w-12 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">No events matching the current filter.</p>
                </div>
            ) : (
                <EventTable events={events} handleBadgeClick={handleBadgeClick}/>
            )}
        </div>
    )
}
