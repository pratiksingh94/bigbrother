"use client"

import { RuleForm } from "@/components/rules/rule-form"
import { createRule } from "@/lib/api"
import { emptyRuleForm, formToRule } from "@/lib/rule-form"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewRulePage() {
    const router = useRouter()
    const [form, setForm] = useState(emptyRuleForm)

    const mutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => router.push("/rules")
    })

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-2xl font-semibold">New Rule</h1>

            <RuleForm
                form={form}
                onChange={setForm}
                onSubmit={() => mutation.mutate(formToRule(form))}
                error={mutation.error?.message}
                pending={mutation.isPending}
                submitLabel="Create Rule"
            />
        </div>
    )

}
