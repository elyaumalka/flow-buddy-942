import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TaskFormDialog, TaskData } from "@/components/admin/TaskFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialTasks: TaskData[] = [
  { title: "שיחה עם ליד חדש - אברהם כהן", customer: "אברהם כהן", dueDate: "11/03/2026", priority: "דחוף", status: "חדש", description: "ליצור קשר ולהציע חבילה" },
  { title: "שליחת חשבונית ליוסי כהן", customer: "יוסי כהן", dueDate: "12/03/2026", priority: "רגיל", status: "בטיפול", description: "חשבונית חודש מרץ" },
  { title: "בדיקת תקלה - רחל לוי", customer: "רחל לוי", dueDate: "13/03/2026", priority: "דחוף", status: "חדש", description: "הלקוחה מדווחת על בעיה בכניסה" },
  { title: "עדכון תנאי חוזה - אבי ישראלי", customer: "אבי ישראלי", dueDate: "15/03/2026", priority: "נמוך", status: "ממתין", description: "עדכון אחוזי עמלה" },
];

const columns = [
  { key: "title", header: "משימה" },
  { key: "customer", header: "לקוח/איש קשר" },
  { key: "dueDate", header: "תאריך יעד" },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminTasks() {
  const { toast } = useToast();
  const [data, setData] = useState(initialTasks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<TaskData | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: TaskData, index: number) => { setEditItem(item); setEditIndex(index); setDialogOpen(true); };
  const handleSave = (item: TaskData) => {
    if (editItem) {
      setData((d) => d.map((r, i) => (i === editIndex ? item : r)));
      toast({ title: "המשימה עודכנה בהצלחה" });
    } else {
      setData((d) => [item, ...d]);
      toast({ title: "משימה חדשה נוספה בהצלחה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">משימות</h1>
        <p className="text-muted-foreground">ניהול משימות אישיות ולקוחות</p>
      </div>
      <DataTable data={data} columns={columns} title="משימות" addLabel="משימה חדשה" onAdd={handleAdd} onRowClick={handleEdit} />
      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
