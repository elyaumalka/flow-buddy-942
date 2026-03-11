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
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, iconClassName, delay = 0 }: StatCardProps) {
  return (
    <Card
      className={cn(
        "card-premium group overflow-hidden animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5 relative">
        {/* Subtle gradient glow on hover */}
        <div className="absolute inset-0 gradient-primary-soft opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-extrabold text-foreground tracking-tight animate-count-up">{value}</p>
            {trend && (
              <div className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                trendUp
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}>
                {trendUp ? "↑" : "↓"} {trend}
              </div>
            )}
          </div>
          <div className={cn(
            "stat-icon shadow-sm",
            iconClassName || "bg-primary/10"
          )}>
            <Icon className={cn("h-5 w-5", iconClassName ? "text-current" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
