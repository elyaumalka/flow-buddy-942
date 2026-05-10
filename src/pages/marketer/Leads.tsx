import { useState } from "react";
import { DataTable, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadFormDialog, LeadFormData } from "@/components/admin/LeadFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם הליד" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "city", header: "כתובת" },
  { key: "community", header: "קהילה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["חדש", "בטיפול", "ממתין", "הושלם"] },
  { key: "community", label: "קהילה" },
  { key: "city", label: "עיר" },
];

export default function MarketerLeads() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update } = useSupabaseTable("leads");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: LeadFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "הליד עודכן" });
    } else {
      await insert({ ...formData, created_by: user?.id });
      toast({ title: "ליד חדש נוסף" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">לידים שלי</h1>
        <p className="text-muted-foreground">ניהול הלידים שהגיעו דרכך</p>
      </div>
      <DataTable data={data} columns={columns} title="לידים" addLabel="ליד חדש" onAdd={handleAdd} searchPlaceholder="חיפוש לפי שם, טלפון..." onRowClick={handleEdit} filters={filters} />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
