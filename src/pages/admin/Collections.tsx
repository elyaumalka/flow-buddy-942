import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import type { FilterDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, DollarSign, Power } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";

export default function AdminCollections() {
  const { toast } = useToast();
  const { data, update, bulkUpdate, bulkRemove } = useSupabaseTable("collections");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const totalDebt = data.reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const pending = data.filter((c: any) => c.status === "ממתין").length;

  const toggleLine = async (item: any) => {
    const next = !item.line_active;
    await update({ id: item.id, line_active: next });
    toast({ title: next ? "הקו הופעל" : "הקו הושבת", description: item.customer_name });
  };

  const columns = [
    { key: "customer_code", header: "קוד", render: (item: any) => item.customer_code ?? "-" },
    { key: "customer_name", header: "שם לקוח" },
    { key: "fail_date", header: "תאריך כשלון", render: (item: any) => new Date(item.fail_date).toLocaleDateString("he-IL") },
    { key: "amount", header: "סכום", render: (item: any) => formatCurrency(item.amount) },
    {
      key: "line_active",
      header: "קו פעיל",
      render: (item: any) => (
        <Badge
          variant="outline"
          className={`font-semibold text-[11px] px-2.5 py-0.5 rounded-full ${
            item.line_active
              ? "bg-success/10 text-success border-success/30"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {item.line_active ? "כן" : "לא"}
        </Badge>
      ),
    },
    { key: "status", header: "סטטוס טיפול", render: (item: any) => <StatusBadge status={item.status} /> },
  ];

  const bulkFields: BulkField[] = [
    { key: "amount", label: "סכום", type: "number" },
    { key: "status", label: "סטטוס טיפול", type: "select", options: ["ממתין", "בטיפול", "טופל", "מבוטל"] },
    { key: "line_active", label: "קו פעיל", type: "select", options: ["true", "false"] },
  ];

  const filters: FilterDef[] = [
    { key: "status", label: "סטטוס טיפול", options: ["ממתין", "בטיפול", "טופל", "מבוטל"] },
    { key: "line_active", label: "קו פעיל", options: ["true", "false"] },
    { key: "customer_name", label: "לקוח" },
  ];

  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    const normalized = { ...updates };
    if ("line_active" in normalized) normalized.line_active = normalized.line_active === "true" || normalized.line_active === true;
    await bulkUpdate({ ids: bulkIds, updates: normalized });
    toast({ title: `${bulkIds.length} רשומות עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} רשומות נמחקו` });
  };

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
      <DataTable
        data={data}
        columns={columns}
        title="חיובים שנכשלו"
        onRowClick={toggleLine}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        filters={filters}
        extraRowActions={[{ label: "החלף קו פעיל", icon: Power, onClick: toggleLine }]}
      />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
