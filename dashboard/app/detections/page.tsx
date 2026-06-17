"use client"

import DetectionTable from "@/components/detections/DetectionTable";
import { getDetections } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

export default function DetectionsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.detections,
        queryFn: getDetections,
        refetchInterval: 30000
    })

    return (
        <div className="flex flex-col gap-6">
            <p className="text-2xl font-semibold">Detections Feed</p>

            {!data || data?.detections.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground"/>
                    <p className="text-sm text-muted-foreground">No detections yet :(</p>
                </div>
            ) : (
                <DetectionTable detections={data.detections}/>
            )}
        </div>
    )
}