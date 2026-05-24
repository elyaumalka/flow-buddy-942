import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { TrendingDown, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { ExpenseFormDialog, ExpenseFormData } from "@/components/customer/ExpenseFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";

const statusMap: Record<string, string> = {
  "מאושר": "bg-success/10 text-success border-success/20",
  "לאישור": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "צפוי": "bg-primary/10 text-primary border-primary/20",
};

const columns = [
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "expense_date", header: "תאריך", render: (item: any) => new Date(item.expense_date).toLocaleDateString("he-IL") },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "category", header: "קטגוריה" },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

const bulkFields: BulkField[] = [
  { key: "type", label: "סוג", type: "select", options: ["חודשי", "חד פעמי"] },
  { key: "category", label: "קטגוריה", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["מאושר", "לאישור", "צפוי"] },
];

export default function CustomerExpenses() {
  const { toast } = useToast();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("expenses", { userScoped: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const total = data.filter((i: any) => i.status === "מאושר").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const expected = data.filter((i: any) => i.status === "צפוי").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const pending = data.filter((i: any) => i.status === "לאישור").length;

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: ExpenseFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "ההוצאה עודכנה" }); }
    else { await insert(formData); toast({ title: "הוצאה חדשה נוספה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} רשומות עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} רשומות נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הוצאות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר ההוצאות שלך</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="הוצאות מאושרות" value={`₪${total.toLocaleString()}`} icon={TrendingDown} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="הוצאות צפויות" value={`₪${expected.toLocaleString()}`} icon={Calendar} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לאישור" value={pending} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      <DataTable data={data} columns={columns} title="הוצאות" addLabel="הוצאה חדשה" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit}
        onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete}
        filters={[{ key: "type", label: "סוג" }, { key: "category", label: "קטגוריה" }, { key: "status", label: "סטטוס" }]} />
      <ExpenseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
