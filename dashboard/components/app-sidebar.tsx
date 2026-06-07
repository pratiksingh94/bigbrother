"use client"

import { Eye, LayoutDashboard, Monitor } from "lucide-react";
import {Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { NavMain } from "./nav-main";

const navMain = [
  { title: "Dashboard", url: "/", icon: <LayoutDashboard/> },
  { title: "Agents", url: "/agents", icon: <Monitor/> }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const items = navMain.map(i => ({
    ...i,
    isActive: i.url === "/" ? pathname === "/" : pathname.startsWith(i.url)
  }))

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="/">
              <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary rounded-lg text-sidebar-primary-foreground">
                <Eye className="size-4"/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Big Brother</span>
                {/* <span className="truncate text-xs">is watching</span> */}
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items}/>
      </SidebarContent>
    </Sidebar>
  )
}