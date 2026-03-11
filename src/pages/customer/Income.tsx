import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const mockIncome = [
  { amount: "₪18,000", date: "01/03/2026", type: "חודשי", category: "משכורת", status: "מאושר" },
  { amount: "₪3,200", date: "05/03/2026", type: "חד פעמי", category: "פרילנס", status: "מאושר" },
  { amount: "₪1,500", date: "10/03/2026", type: "חודשי", category: "שכ״ד", status: "לאישור" },
  { amount: "₪18,000", date: "01/04/2026", type: "חודשי", category: "משכורת", status: "צפוי" },
  { amount: "₪1,500", date: "10/04/2026", type: "חודשי", category: "שכ״ד", status: "צפוי" },
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

export default function CustomerIncome() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הכנסות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר ההכנסות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="הכנסות החודש" value="₪22,700" icon={TrendingUp} iconClassName="bg-success/10 text-success" />
        <StatCard title="הכנסות צפויות" value="₪19,500" icon={Calendar} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לאישור" value={1} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <DataTable
        data={mockIncome}
        columns={columns}
        title="הכנסות"
        addLabel="הכנסה חדשה"
        onAdd={() => toast({ title: "הוספת הכנסה חדשה" })}
        onExport={() => toast({ title: "ייצוא" })}
      />
    </div>
  );
}
