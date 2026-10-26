"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { AlertChannel, AlertChannelInput, AlertChannelKind, Severity } from "@/lib/types"
import { useEffect, useState } from "react"

const KINDS: { value: AlertChannelKind; label: string; hint: string }[] = [
    { value: "webhook", label: "Generic webhook", hint: "The detection is posted as json. Point it at webhook.site to see the payloads." },
    { value: "slack", label: "Slack", hint: "A Slack incoming webhook url." },
    { value: "discord", label: "Discord", hint: "A Discord webhook url." },
]

const SEVERITIES: Severity[] = ["Low", "Medium", "High"]

interface Props {
    open: boolean
    channel: AlertChannel | null
    onOpenChange: (open: boolean) => void
    onSubmit: (values: AlertChannelInput) => void
    pending?: boolean
    error?: string
}

export function ChannelFormSheet({ open, channel, onOpenChange, onSubmit, pending, error }: Props) {
    const [name, setName] = useState(channel?.name ?? "")
    const [kind, setKind] = useState<AlertChannelKind>(channel?.kind ?? "webhook")
    const [url, setUrl] = useState("")
    const [minSeverity, setMinSeverity] = useState<Severity>(channel?.min_severity ?? "Low")
    const [enabled, setEnabled] = useState(channel?.enabled ?? true)

    useEffect(() => {
        if (!open) return

        setName(channel?.name ?? "")
        setKind(channel?.kind ?? "webhook")
        setUrl("")
        setMinSeverity(channel?.min_severity ?? "Low")
        setEnabled(channel?.enabled ?? true)
    }, [open, channel])

    const hint = KINDS.find(k => k.value === kind)?.hint ?? ""

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{channel ? "Edit channel" : "New channel"}</SheetTitle>
                    <SheetDescription>
                        {channel
                            ? "Leave the url empty to keep the one that is stored."
                            : "Where the detections should be sent to."}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 px-4 pb-6">
                    <div className="flex flex-col gap-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Discord alerts" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Type</Label>
                        <Select value={kind} onValueChange={v => setKind(v as AlertChannelKind)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {KINDS.map(k => (
                                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">{hint}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Webhook url</Label>
                        <Input
                            type="password"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder={channel ? channel.url_masked : "https://..."}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Minimum severity</Label>
                        <Select value={minSeverity} onValueChange={v => setMinSeverity(v as Severity)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {SEVERITIES.map(severity => (
                                    <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">
                            Detections below this severity are not sent to this channel.
                        </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                        <Label htmlFor="channel-enabled">Enabled</Label>
                        <Switch id="channel-enabled" checked={enabled} onCheckedChange={setEnabled} />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                        onClick={() => onSubmit({ name, kind, url, enabled, min_severity: minSeverity })}
                        disabled={pending}
                        className="cursor-pointer"
                    >
                        {channel ? "Save Changes" : "Create Channel"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
