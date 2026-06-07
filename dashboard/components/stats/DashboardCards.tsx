import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";


interface Props {
    label: string;
    value: string | undefined;
    icon: LucideIcon;
}

export default function DashboardCard({ label, value, icon: Icon }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary"/>
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {value === undefined ? <Skeleton className="h-7 w-16"/> : <p className="text-2xl font-semibold">{value}</p>}
            </CardContent>
        </Card>
    )
}