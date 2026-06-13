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

export default function EventsPage() {
    const [agentFilter, setAgentFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("")
    const [limit, setLimit] = useState("50")
    const [appliedAgent, setAppliedAgent] = useState("")
    // const [appliedType, setAppliedType] = useState("")
    const [appliedLimit, setAppliedLimit] = useState(50)

    const applyFilters = useCallback(() => {
        setAppliedAgent(agentFilter)
        // setAppliedType(typeFilter)

        const n = parseInt(limit, 10)
        setAppliedLimit(Number.isNaN(n) || n < 1 ? 50 : n);
    }, [agentFilter, limit])

    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.events,
        queryFn: getEvents,
        refetchInterval: 10000
    })

    const { data: hosts } = useQuery({
        queryKey: queryKeys.agents,
        queryFn: getAgents,
        refetchInterval: 60000
    })

    const filtered = data?.events.filter(e => !appliedAgent || e.host.hostname === appliedAgent).filter(e => !typeFilter || e.event_type.toLowerCase().includes(typeFilter.toLowerCase())).slice(0, appliedLimit)

    const handleBadgeClick = (eventType: string) => {
        setTypeFilter(eventType)
        // setAppliedType(eventType)
    }

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
                            <SelectItem value=" " className="cursor-pointer">All Agents</SelectItem>
                            {hosts?.agents.map(h => (
                                <SelectItem key={h.id} value={h.hostname} className="cursor-pointer">{h.hostname}</SelectItem>
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
                    placeholder="50"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="w-24"
                    />
                </div>


                <Button variant="default" onClick={applyFilters}className="cursor-pointer">Apply</Button>
                <Button variant="outline"  className="cursor-pointer" onClick={() => {
                    // i will put these in a func later lmao
                    setAgentFilter("")
                    setTypeFilter("")
                    setLimit("50")
                    setAppliedAgent("")
                    // setAppliedType("")
                    setAppliedLimit(50)
                }}>Clear</Button>
            </div>

            {filtered?.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20">
                    <Activity className="h-12 w-12 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">No events matcing the currennt filter.</p>
                </div>
            ) : (
                <EventTable events={filtered} handleBadgeClick={handleBadgeClick}/>
            )}
        </div>
    )
}