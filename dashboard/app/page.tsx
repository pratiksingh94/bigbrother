"use client"

import DashboardCard from "@/components/stats/DashboardCards";
import { getAgents } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Monitor, Shield } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";




export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    refetchInterval: 10000
  })
  
  
  const onlineCount = data?.agents.filter(a => a.status === "online").length;
  const cards = useMemo(() => [
    { label: "Total Agents", value: data?.agents.length, icon: Monitor },
    { label: "Online Agents", value: onlineCount, icon: Shield }
  ], [data, onlineCount])

  if(error) return <p className="text-lg text-destructive">Failed to load agents, if that doesnt work nothing will lol</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(c => (
          <DashboardCard label={c.label} value={isLoading ? undefined : c.value?.toString()} icon={c.icon} key={c.label}/>
        ))}
      </div>
    </div>
  );
}
