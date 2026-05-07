import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { Percent, CheckCircle, Clock } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";

const columns = [
  { key: "marketer_name", header: "שם משווק" },
  { key: "month", header: "חודש" },
  { key: "amount", header: "סכום עמלה", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "clients_count", header: "לקוחות" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "amount", label: "סכום עמלה", type: "number" },
  { key: "clients_count", label: "כמות לקוחות", type: "number" },
  { key: "month", label: "חודש", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["שולם", "לא שולם", "ממתין"] },
];

export default function AdminCommissions() {
  const { toast } = useToast();
  const { data, bulkUpdate, bulkRemove } = useSupabaseTable("commissions");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const total = data.reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const paid = data.filter((c: any) => c.status === "שולם").reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const pending = total - paid;

  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} עמלות עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} עמלות נמחקו` });
  };

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
      <DataTable data={data} columns={columns} title="עמלות" onExport={() => toast({ title: "ייצוא" })} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
