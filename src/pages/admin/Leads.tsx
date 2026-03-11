import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadFormDialog, LeadFormData } from "@/components/admin/LeadFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "city", header: "כתובת" },
  { key: "community", header: "קהילה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
  { key: "source", header: "מקור הגעה" },
  { key: "marketer_name", header: "משווק מקושר" },
  { key: "created_at", header: "תאריך", render: (item: any) => new Date(item.created_at).toLocaleDateString("he-IL") },
];

export default function AdminLeads() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, isLoading, insert, update } = useSupabaseTable("leads");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: LeadFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "הליד עודכן בהצלחה" });
    } else {
      await insert({ ...formData, created_by: user?.id });
      toast({ title: "ליד חדש נוסף בהצלחה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול לידים</h1>
        <p className="text-muted-foreground">ניהול וטיפול בלידים שמגיעים למערכת</p>
      </div>
      <DataTable data={data} columns={columns} title="לידים" addLabel="ליד חדש" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} searchPlaceholder="חיפוש לפי שם, טלפון, מייל..." onRowClick={handleEdit} />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
