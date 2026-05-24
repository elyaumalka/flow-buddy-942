import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { Heart, TrendingUp, Calculator } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { TitheFormDialog, TitheFormData } from "@/components/customer/TitheFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";

const columns = [
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "tithe_date", header: "תאריך", render: (item: any) => new Date(item.tithe_date).toLocaleDateString("he-IL") },
  { key: "recipient", header: "למי ניתן" },
  { key: "notes", header: "הערות" },
];

const bulkFields: BulkField[] = [
  { key: "recipient", label: "למי ניתן", type: "text" },
  { key: "notes", label: "הערות", type: "text" },
];

export default function CustomerTithes() {
  const { toast } = useToast();
  const { data: tithes, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("tithes", { userScoped: true });
  const { data: incomeData } = useSupabaseTable("income", { userScoped: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const totalIncome = incomeData.filter((i: any) => i.status === "מאושר").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const expectedTithe = Math.round(totalIncome * 0.1);
  const paidTithe = tithes.reduce((sum, t: any) => sum + Number(t.amount || 0), 0);
  const remaining = Math.max(expectedTithe - paidTithe, 0);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: TitheFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "התרומה עודכנה" }); }
    else { await insert(formData); toast({ title: "תרומה חדשה נוספה" }); }
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
        <h1 className="text-2xl font-bold text-foreground">מעשרות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר מעשרות וצדקה</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="מעשר צפוי (10%)" value={`₪${expectedTithe.toLocaleString()}`} icon={Calculator} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="שולם" value={`₪${paidTithe.toLocaleString()}`} icon={Heart} iconClassName="bg-success/10 text-success" />
        <StatCard title="נותר לתשלום" value={`₪${remaining.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      <DataTable data={tithes} columns={columns} title="מעשרות וצדקה" addLabel="תרומה חדשה" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit}
        onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete}
        filters={[{ key: "recipient", label: "למי ניתן" }]} />
      <TitheFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
