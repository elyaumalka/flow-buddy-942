import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "חדש": "bg-primary/10 text-primary border-primary/20",
  "בטיפול": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "הושלם": "bg-success/10 text-success border-success/20",
  "ממתין": "bg-chart-4/10 text-chart-4 border-chart-4/20",
  "פעיל": "bg-success/10 text-success border-success/20",
  "לא פעיל": "bg-muted text-muted-foreground border-border",
  "שולם": "bg-success/10 text-success border-success/20",
  "לא שולם": "bg-destructive/10 text-destructive border-destructive/20",
  "נכשל": "bg-destructive/10 text-destructive border-destructive/20",
  "דחוף": "bg-destructive/10 text-destructive border-destructive/20",
  "רגיל": "bg-primary/10 text-primary border-primary/20",
  "נמוך": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status] || "")}>
      {status}
    </Badge>
  );
}
