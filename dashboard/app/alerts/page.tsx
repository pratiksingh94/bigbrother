"use client"

import { ChannelFormSheet } from "@/components/alerts/channel-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    createAlertChannel,
    deleteAlertChannel,
    getAlertChannels,
    getAlertNotifications,
    testAlertChannel,
    updateAlertChannel,
} from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { AlertChannel, AlertChannelInput } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Plus, Send, Trash2 } from "lucide-react"
import { useState } from "react"

const KIND_LABELS: Record<string, string> = {
    webhook: "Webhook",
    slack: "Slack",
    discord: "Discord",
}

export default function AlertsPage() {
    const queryClient = useQueryClient()
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<AlertChannel | null>(null)
    const [tested, setTested] = useState<{ name: string; ok: boolean; error: string | null } | null>(null)

    const { data: channels, isLoading } = useQuery({
        queryKey: queryKeys.alertChannels,
        queryFn: getAlertChannels,
    })

    const { data: notifications } = useQuery({
        queryKey: queryKeys.alertNotifications,
        queryFn: getAlertNotifications,
        refetchInterval: 15000,
    })

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.alertChannels })
        queryClient.invalidateQueries({ queryKey: queryKeys.alertNotifications })
    }

    const createMutation = useMutation({
        mutationFn: createAlertChannel,
        onSuccess: () => {
            invalidate()
            setFormOpen(false)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: AlertChannelInput }) =>
            updateAlertChannel(id, values),
        onSuccess: () => {
            invalidate()
            setFormOpen(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteAlertChannel,
        onSuccess: invalidate,
    })

    const testMutation = useMutation({
        mutationFn: testAlertChannel,
        onSuccess: (result, id) => {
            const channel = channels?.find(c => c.id === id)
            setTested({ name: channel?.name ?? "channel", ok: result.ok, error: result.error })
        },
    })

    const openNew = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const openEdit = (channel: AlertChannel) => {
        setEditing(channel)
        setFormOpen(true)
    }

    const submit = (values: AlertChannelInput) => {
        if (editing) {
            updateMutation.mutate({ id: editing.id, values })
        } else {
            createMutation.mutate(values)
        }
    }

    const formError = editing
            ? updateMutation.error?.message
            : createMutation.error?.message

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Alert Channels</h1>
                <Button size="sm" onClick={openNew} className="cursor-pointer">
                    <Plus className="mr-1 h-4 w-4"/>
                    New Channel
                </Button>
            </div>

            {tested && (
                <p className={tested.ok ? "text-sm text-success" : "text-sm text-destructive"}>
                    {tested.ok
                        ? `Test notification sent to ${tested.name}.`
                        : `Could not reach ${tested.name}: ${tested.error}`}
                </p>
            )}

            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
            ) : !channels || channels.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20">
                    <Bell className="h-12 w-12 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">No alert channels yet.</p>
                    <p className="text-sm text-muted-foreground">Add one to get told when a detection fires.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Url</TableHead>
                            <TableHead>Min severity</TableHead>
                            <TableHead>Enabled</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {channels.map(channel => (
                            <TableRow key={channel.id}>
                                <TableCell className="font-medium">{channel.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{KIND_LABELS[channel.kind] ?? channel.kind}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {channel.url_masked}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{channel.min_severity}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={channel.enabled ? "default" : "secondary"}>
                                        {channel.enabled ? "enabled" : "disabled"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Send a test notification"
                                            onClick={() => testMutation.mutate(channel.id)}
                                            disabled={testMutation.isPending}
                                            className="cursor-pointer"
                                        >
                                            <Send className="h-4 w-4"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEdit(channel)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(channel.id)}
                                            disabled={deleteMutation.isPending}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Recent deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    {!notifications || notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nothing has been sent yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Detection</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attempts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.slice(0, 20).map(notification => (
                                    <TableRow key={notification.id}>
                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                            {new Date(notification.sent_at).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium">{notification.channel_name}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`/detections/${notification.detection_id}`}
                                                className="font-mono text-xs hover:underline"
                                            >
                                                #{notification.detection_id}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {notification.status === "sent" ? (
                                                <Badge variant="default">sent</Badge>
                                            ) : (
                                                <Badge variant="destructive" title={notification.error ?? undefined}>
                                                    failed
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{notification.attempts}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ChannelFormSheet
                open={formOpen}
                channel={editing}
                onOpenChange={setFormOpen}
                onSubmit={submit}
                pending={createMutation.isPending || updateMutation.isPending}
                error={formError}
            />
        </div>
    )
}
