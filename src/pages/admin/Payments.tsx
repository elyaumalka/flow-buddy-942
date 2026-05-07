import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";

const columns = [
  { key: "customer_name", header: "שם לקוח" },
  { key: "payment_date", header: "תאריך חיוב", render: (item: any) => new Date(item.payment_date).toLocaleDateString("he-IL") },
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "invoice", header: "חשבונית" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "amount", label: "סכום חיוב", type: "number" },
  { key: "invoice", label: "חשבונית", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["שולם", "ממתין", "נכשל", "מבוטל"] },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const { data, bulkUpdate, bulkRemove } = useSupabaseTable("payments");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} תשלומים עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} תשלומים נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">תשלומי מנויים</h1>
        <p className="text-muted-foreground">ניהול תשלומי מנויים וחשבוניות</p>
      </div>
      <DataTable data={data} columns={columns} title="תשלומים" onExport={() => toast({ title: "ייצוא" })} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
