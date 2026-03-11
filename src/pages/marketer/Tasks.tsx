import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TaskFormDialog, TaskFormData } from "@/components/admin/TaskFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "customer", header: "שם לקוח" },
  { key: "title", header: "נושא" },
  { key: "due_date", header: "תאריך יעד" },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "description", header: "תיאור" },
];

export default function MarketerTasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update } = useSupabaseTable("tasks");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: TaskFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "המשימה עודכנה" });
    } else {
      await insert({ ...formData, created_by: user?.id });
      toast({ title: "משימה חדשה נוספה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">משימות</h1>
        <p className="text-muted-foreground">ניהול המשימות שלך</p>
      </div>
      <DataTable data={data} columns={columns} title="משימות" addLabel="משימה חדשה" onAdd={handleAdd} onRowClick={handleEdit} />
      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
