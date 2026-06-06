"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, Monitor, PanelLeft, PanelLeftClose } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"


// question to self: should i call it agents in frontend too?
const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Agents", href: "/agents", icon: Monitor }
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn("flex flex-col bordere-r border-border bg-background transition-all duration-200", collapsed ? "w-14" : "w-56")}>
            <div className={cn("flex h-14 items-center border-b border-r border-border", collapsed ? "justify-center" : "gap-2 px-5")}>
                <Monitor className="h-5 w-5 shrink-0 text-primary"/>
                {!collapsed && (
                    <span className="text-sm font-semibold tracking-wide text-foreground">Big Brother</span>
                )}
            </div>

            <nav className="flex-1 space-y-1 p-3 border-r border-border">
                {navItems.map(i => {
                    const isActive = i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)

                    return (
                        <Link
                            key={i.href}
                            href={i.href}
                            className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", collapsed && "justify-center px-0", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
                        >
                            <i.icon className="h-4 w-4 shrink-0"/>
                            {!collapsed && i.label}
                        </Link>
                    )
                })}
            </nav>

            <div className={cn("flex border-t border-border border-r p-3", collapsed ? "justify-center" : "justify-end")}>
                <button type="button" onClick={() => setCollapsed(c => !c)} className="flex items-center justify-center cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    {collapsed ? (
                        <PanelLeft className="h-4 w-4"/>
                    ) : (
                        <PanelLeftClose className="h-4 w-4"/>
                    )}
                </button>
            </div>
        </aside>
    )
}