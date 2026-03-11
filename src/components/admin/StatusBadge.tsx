import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "חדש": "bg-primary/10 text-primary border-primary/30 shadow-glow-sm",
  "בטיפול": "bg-chart-3/10 text-chart-3 border-chart-3/30",
  "הושלם": "bg-success/10 text-success border-success/30",
  "ממתין": "bg-chart-4/10 text-chart-4 border-chart-4/30",
  "פעיל": "bg-success/10 text-success border-success/30",
  "לא פעיל": "bg-muted text-muted-foreground border-border",
  "שולם": "bg-success/10 text-success border-success/30",
  "לא שולם": "bg-destructive/10 text-destructive border-destructive/30",
  "נכשל": "bg-destructive/10 text-destructive border-destructive/30",
  "דחוף": "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
  "רגיל": "bg-primary/10 text-primary border-primary/30",
  "נמוך": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-[11px] px-2.5 py-0.5 rounded-full transition-all duration-200 hover:scale-105",
        statusStyles[status] || ""
      )}
    >
      {status}
    </Badge>
  );
}
