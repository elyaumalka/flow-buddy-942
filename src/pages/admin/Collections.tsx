import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";

const mockCollections = [
  { customer: "דוד אברהם", failDate: "01/03/2026", amount: "₪149", status: "ממתין", daysPassed: "10 ימים" },
  { customer: "יעקב מזרחי", failDate: "15/02/2026", amount: "₪199", status: "בטיפול", daysPassed: "24 ימים" },
  { customer: "נועה פרידמן", failDate: "01/02/2026", amount: "₪149", status: "ממתין", daysPassed: "38 ימים" },
];

const columns = [
  { key: "customer", header: "שם לקוח" },
  { key: "failDate", header: "תאריך כשלון" },
  { key: "amount", header: "סכום" },
  { key: "daysPassed", header: "זמן שעבר" },
  { key: "status", header: "סטטוס טיפול", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminCollections() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הו״ק לטיפול</h1>
        <p className="text-muted-foreground">חיובים שנכשלו הדורשים טיפול</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="סה״כ חובות" value="₪497" icon={DollarSign} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="ממתינים לטיפול" value={2} icon={AlertTriangle} iconClassName="bg-chart-3/10 text-chart-3" />
        <StatCard title="ממוצע ימים" value="24" icon={Clock} iconClassName="bg-primary/10 text-primary" />
      </div>
      <DataTable data={mockCollections} columns={columns} title="חיובים שנכשלו" />
    </div>
  );
}
