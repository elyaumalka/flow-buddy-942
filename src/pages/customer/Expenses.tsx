import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { TrendingDown, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const mockExpenses = [
  { amount: "₪4,500", date: "01/03/2026", type: "חודשי", category: "שכר דירה", status: "מאושר" },
  { amount: "₪850", date: "03/03/2026", type: "חד פעמי", category: "מזון", status: "מאושר" },
  { amount: "₪380", date: "07/03/2026", type: "חודשי", category: "חשמל", status: "מאושר" },
  { amount: "₪200", date: "08/03/2026", type: "חודשי", category: "אינטרנט", status: "לאישור" },
  { amount: "₪1,200", date: "10/03/2026", type: "חד פעמי", category: "ביגוד", status: "מאושר" },
  { amount: "₪4,500", date: "01/04/2026", type: "חודשי", category: "שכר דירה", status: "צפוי" },
  { amount: "₪380", date: "07/04/2026", type: "חודשי", category: "חשמל", status: "צפוי" },
];

const statusMap: Record<string, string> = {
  "מאושר": "bg-success/10 text-success border-success/20",
  "לאישור": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "צפוי": "bg-primary/10 text-primary border-primary/20",
};

const columns = [
  { key: "amount", header: "סכום" },
  { key: "date", header: "תאריך" },
  { key: "type", header: "סוג", render: (item: any) => (
    <Badge variant="outline" className="font-medium">{item.type}</Badge>
  )},
  { key: "category", header: "קטגוריה" },
  { key: "status", header: "סטטוס", render: (item: any) => (
    <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge>
  )},
];

export default function CustomerExpenses() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הוצאות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר ההוצאות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="הוצאות החודש" value="₪7,130" icon={TrendingDown} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="הוצאות צפויות" value="₪4,880" icon={Calendar} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לאישור" value={1} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <DataTable
        data={mockExpenses}
        columns={columns}
        title="הוצאות"
        addLabel="הוצאה חדשה"
        onAdd={() => toast({ title: "הוספת הוצאה חדשה" })}
        onExport={() => toast({ title: "ייצוא" })}
      />
    </div>
  );
}
