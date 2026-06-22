"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const STATUS_OPTIONS = [
    { label: "Investigating", value: "investigating" },
    { label: "Resolved", value: "resolved" },
    { label: "False Positive", value: "false-positive" },
]




export function StatusButton({ currentStatus, onStatusChange, isPending }: { currentStatus: string, onStatusChange: (status: string) => void, isPending: boolean }) {
    const [selected, setSelected] = useState(
        STATUS_OPTIONS.find(o => o.value !== currentStatus) ?? STATUS_OPTIONS[0]
    )

    return (
        <div className="flex items-center">
            <Button
                size="sm"
                onClick={() => onStatusChange(selected.value)}
                disabled={isPending}
                className="rounded-r-none border-r-0 cursor-pointer"
            >
                Mark as {selected.label}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="rounded-l-none px-2 cursor-pointer"
                        disabled={isPending}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {STATUS_OPTIONS.filter(o => o.value !== currentStatus).map(option => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => setSelected(option)}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}