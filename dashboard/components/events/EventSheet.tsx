import { Event } from "@/lib/types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { formatLastSeen } from "@/lib/agent-utils";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function EventSheet({ event, open, onOpenChange }: { event: Event, open: boolean, onOpenChange: (open: boolean) => void }) {
    if(!event) return null
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[55vh]">
                <SheetHeader>
                    <SheetTitle>{event.event_type}</SheetTitle>
                    <SheetDescription>Event #{event.id}</SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto px-4 pb-4">
                    <div className="gap-5 flex flex-col">
                        <div className="gap-1 flex flex-col">
                            <span className="font-medium text-xs text-muted-foreground">
                                Event Type
                            </span>
                            <p className="font-mono text-xs text-foreground"><Badge variant="secondary">{event.event_type}</Badge></p>
                        </div>

                        <div className="gap-1 flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground">Host</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="font-medium">{event.host.hostname}</p>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {event.host.id}
                                </TooltipContent>
                            </Tooltip>
                            {/* <p className="font-mono text-xs bg-muted rounded-sm p-2 break-all leading-relaxed">ID: {event.host.id}</p> */}
                        </div>


                        <div className="gap-1 flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground">
                                Created At
                            </span>
                            <p>{formatLastSeen(event.created_at)}</p>
                        </div>

                        {event.log && (
                            <div className="gap-1 flex flex-col">
                            <span className="font-medium text-xs text-muted-foreground">Log Source</span>
                            <p className="font-mono text-xs">{event.log.source}</p>
                        </div>
                        )}
                    </div>

                    <div className="gap-5 flex flex-col">
                        {event.log && (
                            <div className="gap-1 flex flex-col">
                            <span className="font-medium text-xs text-muted-foreground">Raw Log</span>
                            <p className="font-mono text-xs bg-muted rounded-sm p-2 break-all leading-relaxed">{event.log.raw}</p>
                        </div>
                        )}

                        <div className="gap-1 flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground">Context</span>

                            {Object.keys(event.context).map(e => (
                                <div key={e} className="flex gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">{e}: </span>
                                <span className="text-foreground">
                                    {event.context[e] === "" ? "N/A" : String(event.context[e])}
                                </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}