"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "../ui/separator"


const pageTitleFromPath = (pathname: string) => {
    if (pathname === "/") return "Dashboard - Big Brother is Watching"
    const segments = pathname.split("/").filter(Boolean)
    return segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ")
}

export default function Topbar() {
    const pathname = usePathname()
    const title = pageTitleFromPath(pathname)

    const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

    useEffect(() => {
        async function ping() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, { signal: AbortSignal.timeout(3) })
                setBackendOnline(res.ok)
                // console.log(res.ok)
            } catch {
                setBackendOnline(false)
            }
        }

        ping()
        const interval = setInterval(ping, 15000)

        return () => clearInterval(interval)
    }, [])

    return (
        <header className="shrink-0 flex h-14 items-center gap-2 border-b border-border px-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 cursor-pointer"/>
                <Separator orientation="vertical" className="h-4"/>
                <h1 className="text-sm font-medium text-foreground">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
                <div
                    className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs",
                        backendOnline === null
                        ? "border-border text-muted-foreground"
                        : backendOnline
                            ? "border-primary/30 text-primary"
                            : "border-destructive/30 text-destructive",
                    )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", backendOnline === null ? "bg-muted-foreground" : backendOnline ? "bg-primary" : "bg-destructive")}/>
                        Backend
                </div>
            </div>
        </header>
    )
}