"use client"

import { RuleForm } from "@/components/rules/rule-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { severityBadgeClass } from "@/lib/detections-utils"
import { getRule, updateRule } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { describeRule, formToRule, ruleToForm } from "@/lib/rule-form"
import { Rule } from "@/lib/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RuleDetails({ id }: { id: number }) {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.rule(id),
        queryFn: () => getRule(id)
    })

    if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>
    if (error) return <div className="text-sm text-destructive">Failed to load rule.</div>
    if (!data) return <div className="text-sm text-muted-foreground">Rule not found.</div>

    return <RuleEditor rule={data}/>
}

function RuleEditor({ rule }: { rule: Rule }) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState(() => ruleToForm(rule))
    const [saved, setSaved] = useState(false)

    const mutation = useMutation({
        mutationFn: (values: ReturnType<typeof formToRule>) => updateRule(rule.id, values),
        onSuccess: () => {
            setSaved(true)
            queryClient.invalidateQueries({ queryKey: queryKeys.rules })
            queryClient.invalidateQueries({ queryKey: queryKeys.rule(rule.id) })
        }
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="link" asChild size="sm" className="px-0 text-muted-foreground">
                    <Link href="/rules">
                        <ArrowLeft className="mr-1 h-4 w-4"/>
                        Back to Rules
                    </Link>
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">{rule.name}</h1>
                    <p className="text-sm text-muted-foreground">Rule #{rule.id}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">{rule.rule_type}</Badge>
                    <Badge variant="outline" className={severityBadgeClass(rule.severity)}>{rule.severity}</Badge>
                    {!rule.enabled && <Badge variant="secondary">disabled</Badge>}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">What it watches for</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{describeRule(form)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Edit rule</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 max-w-lg">
                    <RuleForm
                        form={form}
                        onChange={(next) => {
                            setForm(next)
                            setSaved(false)
                        }}
                        onSubmit={() => mutation.mutate(formToRule(form))}
                        error={mutation.error?.message}
                        pending={mutation.isPending}
                        submitLabel="Save Changes"
                    />

                    {saved && !mutation.error && (
                        <p className="text-sm text-success">Rule saved.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
