import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { Percent, CheckCircle, Clock } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";

export default function AdminCommissions() {
  const { toast } = useToast();
  const { data } = useSupabaseTable("commissions");

  const total = data.reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const paid = data.filter((c: any) => c.status === "שולם").reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const pending = total - paid;

  const columns = [
    { key: "marketer_name", header: "שם משווק" },
    { key: "month", header: "חודש" },
    { key: "amount", header: "סכום עמלה", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
    { key: "clients_count", header: "לקוחות" },
    { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">עמלות משווקים</h1>
        <p className="text-muted-foreground">ניהול עמלות ותשלומים למשווקים</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="סה״כ עמלות" value={`₪${total.toLocaleString()}`} icon={Percent} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="שולמו" value={`₪${paid.toLocaleString()}`} icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="ממתינות" value={`₪${pending.toLocaleString()}`} icon={Clock} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      <DataTable data={data} columns={columns} title="עמלות" onExport={() => toast({ title: "ייצוא" })} />
    </div>
  );
}
