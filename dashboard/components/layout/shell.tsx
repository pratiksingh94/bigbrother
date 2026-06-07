import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function Shell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <Topbar/>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}