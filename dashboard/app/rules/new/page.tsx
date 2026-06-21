"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRule } from "@/lib/api"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewRulePage() {
    const router = useRouter()

    const [name, setName] = useState("")
    const [ruleType, setRuleType] = useState<"match" | "threshold">("match")
    const [eventType, setEventType] = useState("")
    const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Medium")

    // match specific
    const [field, setField] = useState("")
    const [values, setValues] = useState("")

    // threshold specific
    const [groupBy, setGroupBy] = useState("")
    const [threshold, setThreshold] = useState(5)
    const [windowSeconds, setWindowSeconds] = useState(60)

    const mutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => router.push("/rules")
    })

    const handleSubmit = () => {
        const conditions = ruleType === "match"
        ? { field, in: values.split(",").map(v => v.trim()).filter(Boolean)}
        : { group_by: groupBy, threshold, windows_seconds: windowSeconds }

        mutation.mutate({
            name,
            rule_type: ruleType,
            event_type: eventType,
            conditions,
            severity
        })
    }


    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-2xl font-semibold">New Rule</h1>

            <div className="flex flex-col gap-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="SSH Bruteforce" />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Event Type</Label>
                <Input value={eventType} onChange={e => setEventType(e.target.value)} placeholder="authentication.failure"/>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Rule Type</Label>
                <Select value={ruleType} onValueChange={v => setRuleType(v as "match" | "threshold")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="threshold">Threshold</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {ruleType === "match" ? (
                <>
                <div className="flex flex-col gap-2">
                    <Label>Field</Label>
                    <Input value={field} onChange={e => setField(e.target.value)} placeholder="name"/>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Values (comma seperated)</Label>
                    <Input value={values} onChange={e => setValues(e.target.value)} placeholder="nc, netcat, ncat"/>
                </div>
                </>
            ) : (
                <>
                <div className="flex flex-col gap-2">
                    <Label>Group By Field</Label>
                    <Input value={groupBy} onChange={e => setGroupBy(e.target.value)} placeholder="source_ip"/>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Threshold Count</Label>
                    <Input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))}/>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Window (seconds)</Label>
                    <Input type="number" value={windowSeconds} onChange={e => setWindowSeconds(Number(e.target.value))}/>
                </div>
                </>
            )}


            <div className="flex flex-col gap-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={v => setSeverity(v as typeof severity)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            <Button onClick={handleSubmit} disabled={mutation.isPending} className="cursor-pointer">
                Create Rule
            </Button>
        </div>
    )

}