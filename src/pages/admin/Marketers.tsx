import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarketerFormDialog, MarketerFormData } from "@/components/admin/MarketerFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import type { FilterDef } from "@/components/admin/DataTable";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "commission", header: "תנאי עמלה" },
  { key: "coupon", header: "קוד קופון" },
  { key: "partner_name", header: "שותף מקושר" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "community", label: "קהילה", type: "text" },
  { key: "commission", label: "תנאי עמלה", type: "text" },
  { key: "partner_name", label: "שותף מקושר", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["פעיל", "לא פעיל", "מושהה"] },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["פעיל", "לא פעיל", "מושהה"] },
  { key: "community", label: "קהילה" },
  { key: "partner_name", label: "שותף מקושר" },
];

export default function AdminMarketers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("marketers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: MarketerFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "המשווק עודכן בהצלחה" }); }
    else { await insert({ ...formData, created_by: user?.id }); toast({ title: "משווק חדש נוסף בהצלחה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} משווקים עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} משווקים נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול משווקים</h1>
        <p className="text-muted-foreground">ניהול משווקים, קודי קופון ועמלות</p>
      </div>
      <DataTable data={data} columns={columns} title="משווקים" addLabel="משווק חדש" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} filters={filters} />
      <MarketerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
