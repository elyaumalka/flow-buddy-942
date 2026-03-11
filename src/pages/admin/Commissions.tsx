import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { Percent, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCommissions = [
  { marketer: "אבי ישראלי", month: "מרץ 2026", amount: "₪2,100", clients: 15, status: "לא שולם" },
  { marketer: "מיכל דוד", month: "מרץ 2026", amount: "₪1,680", clients: 12, status: "לא שולם" },
  { marketer: "נתן ברק", month: "מרץ 2026", amount: "₪1,040", clients: 8, status: "שולם" },
  { marketer: "אבי ישראלי", month: "פברואר 2026", amount: "₪1,900", clients: 14, status: "שולם" },
];

export default function AdminCommissions() {
  const { toast } = useToast();

  const columns = [
    { key: "marketer", header: "שם משווק" },
    { key: "month", header: "חודש" },
    { key: "amount", header: "סכום עמלה" },
    { key: "clients", header: "לקוחות" },
    { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
    {
      key: "actions", header: "פעולות", render: (item: any) => (
        item.status === "לא שולם" ? (
          <Button size="sm" variant="outline" onClick={() => toast({ title: "העלאת הוכחת תשלום" })}>
            <Upload className="h-3 w-3 ml-1" />
            הוכחת תשלום
          </Button>
        ) : <span className="text-xs text-muted-foreground">שולם ✓</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">עמלות משווקים</h1>
        <p className="text-muted-foreground">ניהול עמלות ותשלומים למשווקים</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="סה״כ עמלות החודש" value="₪4,820" icon={Percent} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="שולמו" value="₪1,040" icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="ממתינות" value="₪3,780" icon={Clock} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      <DataTable data={mockCommissions} columns={columns} title="עמלות" onExport={() => toast({ title: "ייצוא" })} />
    </div>
  );
}
