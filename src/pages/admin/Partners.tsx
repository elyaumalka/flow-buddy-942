import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PartnerFormDialog, PartnerFormData } from "@/components/admin/PartnerFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם שותף" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "commission", header: "תנאי עמלה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "commission", label: "תנאי עמלה", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["פעיל", "לא פעיל"] },
];

export default function AdminPartners() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("partners");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: PartnerFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "השותף עודכן בהצלחה" }); }
    else { await insert({ ...formData, created_by: user?.id }); toast({ title: "שותף חדש נוסף בהצלחה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} שותפים עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} שותפים נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול שותפים</h1>
        <p className="text-muted-foreground">שותפים אחראי משווקים</p>
      </div>
      <DataTable data={data} columns={columns} title="שותפים" addLabel="שותף חדש" onAdd={handleAdd} onRowClick={handleEdit} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} />
      <PartnerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
