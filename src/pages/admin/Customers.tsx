import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerFormDialog, CustomerFormData } from "@/components/admin/CustomerFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "modules", header: "מודולים" },
  { key: "marketer_name", header: "משווק" },
  { key: "subscription", header: "מנוי", render: (item: any) => <StatusBadge status={item.subscription} /> },
  { key: "join_date", header: "הצטרפות", render: (item: any) => new Date(item.join_date).toLocaleDateString("he-IL") },
];

const bulkFields: BulkField[] = [
  { key: "community", label: "קהילה", type: "text" },
  { key: "modules", label: "מודולים", type: "text" },
  { key: "marketer_name", label: "משווק", type: "text" },
  { key: "subscription", label: "סטטוס מנוי", type: "select", options: ["פעיל", "לא פעיל", "מושהה"] },
];

export default function AdminCustomers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: CustomerFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "הלקוח עודכן בהצלחה" }); }
    else { await insert({ ...formData, created_by: user?.id }); toast({ title: "לקוח חדש נוסף בהצלחה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} לקוחות עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} לקוחות נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול לקוחות</h1>
        <p className="text-muted-foreground">ניהול לקוחות משלמים במערכת</p>
      </div>
      <DataTable data={data} columns={columns} title="לקוחות" addLabel="לקוח חדש" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} />
      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
