import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

export default function AdminCollections() {
  const { data } = useSupabaseTable("collections");

  const totalDebt = data.reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const pending = data.filter((c: any) => c.status === "ממתין").length;

  const columns = [
    { key: "customer_name", header: "שם לקוח" },
    { key: "fail_date", header: "תאריך כשלון", render: (item: any) => new Date(item.fail_date).toLocaleDateString("he-IL") },
    { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
    { key: "status", header: "סטטוס טיפול", render: (item: any) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הו״ק לטיפול</h1>
        <p className="text-muted-foreground">חיובים שנכשלו הדורשים טיפול</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="סה״כ חובות" value={`₪${totalDebt.toLocaleString()}`} icon={DollarSign} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="ממתינים לטיפול" value={pending} icon={AlertTriangle} iconClassName="bg-chart-3/10 text-chart-3" />
        <StatCard title="סה״כ רשומות" value={data.length} icon={Clock} iconClassName="bg-primary/10 text-primary" />
      </div>
      <DataTable data={data} columns={columns} title="חיובים שנכשלו" />
    </div>
  );
}
