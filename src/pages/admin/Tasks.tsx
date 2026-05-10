import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TaskFormDialog, TaskFormData } from "@/components/admin/TaskFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import type { FilterDef } from "@/components/admin/DataTable";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "title", header: "משימה" },
  { key: "customer", header: "לקוח/איש קשר" },
  { key: "due_date", header: "תאריך יעד" },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "customer", label: "לקוח/איש קשר", type: "text" },
  { key: "due_date", label: "תאריך יעד", type: "text" },
  { key: "priority", label: "דחיפות", type: "select", options: ["דחוף", "רגיל", "נמוך"] },
  { key: "status", label: "סטטוס", type: "select", options: ["חדש", "בטיפול", "ממתין", "הושלם"] },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["חדש", "בטיפול", "ממתין", "הושלם"] },
  { key: "priority", label: "דחיפות", options: ["דחוף", "רגיל", "נמוך"] },
  { key: "customer", label: "לקוח" },
];

export default function AdminTasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("tasks");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: TaskFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "המשימה עודכנה בהצלחה" }); }
    else { await insert({ ...formData, created_by: user?.id }); toast({ title: "משימה חדשה נוספה בהצלחה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} משימות עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} משימות נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">משימות</h1>
        <p className="text-muted-foreground">ניהול משימות אישיות ולקוחות</p>
      </div>
      <DataTable data={data} columns={columns} title="משימות" addLabel="משימה חדשה" onAdd={handleAdd} onRowClick={handleEdit} onBulkEdit={handleBulkEdit} onBulkDelete={handleBulkDelete} filters={filters} />
      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
