"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteRule, getRules, toggleRule } from "@/lib/api"
import { severityBadgeClass } from "@/lib/detections-utils"
import { queryKeys } from "@/lib/query-keys"
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function RulesPage() {
    const queryClient = useQueryClient()
    const {data, isLoading} = useQuery({
        queryKey: queryKeys.rules,
        queryFn: getRules
    })

    const toggleMutation = useMutation({
        mutationFn: toggleRule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rules })
    })

    const deleteMutation = useMutation({
        mutationFn: deleteRule,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rules })
    })

    if(isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Rules</h1>
                <Button size="sm" asChild>
                    <Link href="/rules/new">
                        <Plus className="mr-1 h-4 w-4"/>
                        New Rule
                    </Link>
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Enabled</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.rules.map(rule => (
                        <TableRow key={rule.id}>
                            <TableCell className="font-medium">
                                <Link href={`/rules/${rule.id}`} className="hover:underline">{rule.name}</Link>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {rule.event_type}
                            </TableCell>

                            <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                    {rule.rule_type}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                <Badge variant="outline" className={severityBadgeClass(rule.severity)}>
                                    {rule.severity}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                <Switch
                                    checked={rule.enabled}
                                    onCheckedChange={() => toggleMutation.mutate(rule.id)}
                                />
                            </TableCell>

                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(rule.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}