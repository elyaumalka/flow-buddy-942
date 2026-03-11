import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={cn("text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
                {trend}
              </p>
            )}
          </div>
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", iconClassName || "bg-primary/10")}>
            <Icon className={cn("h-5 w-5", iconClassName ? "text-current" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
