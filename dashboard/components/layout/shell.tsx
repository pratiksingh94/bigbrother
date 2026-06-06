import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar/>
            <div className="flex flex-1 flex-col">
                <Topbar/>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    )
}