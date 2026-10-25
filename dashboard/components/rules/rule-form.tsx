"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RuleFormValues } from "@/lib/rule-form"

interface Props {
    form: RuleFormValues
    onChange: (form: RuleFormValues) => void
    onSubmit: () => void
    error?: string
    pending?: boolean
    submitLabel: string
}

export function RuleForm({ form, onChange, onSubmit, error, pending, submitLabel }: Props) {
    const set = <K extends keyof RuleFormValues>(key: K, value: RuleFormValues[K]) =>
        onChange({ ...form, [key]: value })

    return (
        <>
            <div className="flex flex-col gap-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="SSH Bruteforce" />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Event Type</Label>
                <Input value={form.event_type} onChange={e => set("event_type", e.target.value)} placeholder="authentication.failure" />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Rule Type</Label>
                <Select value={form.rule_type} onValueChange={v => set("rule_type", v as RuleFormValues["rule_type"])}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="threshold">Threshold</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {form.rule_type === "match" ? (
                <>
                    <div className="flex flex-col gap-2">
                        <Label>Field</Label>
                        <Input value={form.field} onChange={e => set("field", e.target.value)} placeholder="name" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Values (comma seperated)</Label>
                        <Input value={form.values} onChange={e => set("values", e.target.value)} placeholder="nc, netcat, ncat" />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        <Label>Group By Field</Label>
                        <Input value={form.group_by} onChange={e => set("group_by", e.target.value)} placeholder="source_ip" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Threshold Count</Label>
                        <Input type="number" value={form.threshold} onChange={e => set("threshold", Number(e.target.value))} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Window (seconds)</Label>
                        <Input type="number" value={form.window_seconds} onChange={e => set("window_seconds", Number(e.target.value))} />
                    </div>
                </>
            )}

            <div className="flex flex-col gap-2">
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => set("severity", v as RuleFormValues["severity"])}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex flex-col gap-0.5">
                    <Label htmlFor="rule-enabled">Enabled</Label>
                    <span className="text-xs text-muted-foreground">Disabled rules are skipped by the engine</span>
                </div>
                <Switch id="rule-enabled" checked={form.enabled} onCheckedChange={v => set("enabled", v)} />
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={onSubmit} disabled={pending} className="cursor-pointer">
                {submitLabel}
            </Button>
        </>
    )
}
