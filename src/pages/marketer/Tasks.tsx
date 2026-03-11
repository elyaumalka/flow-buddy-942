import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockTasks = [
  { title: "שיחה עם אברהם כהן", customer: "אברהם כהן", dueDate: "11/03/2026", priority: "דחוף", description: "להציע חבילה פרימיום" },
  { title: "שליחת הצעה לשרה לוי", customer: "שרה לוי", dueDate: "12/03/2026", priority: "דחוף", description: "שליחת הצעת מחיר מעודכנת" },
  { title: "מעקב אחר משה דוד", customer: "משה דוד", dueDate: "13/03/2026", priority: "רגיל", description: "בדיקה האם קיבל החלטה" },
  { title: "עדכון פרטי לקוח", customer: "רחל אברהם", dueDate: "15/03/2026", priority: "נמוך", description: "עדכון כתובת מייל" },
];

const columns = [
  { key: "customer", header: "שם לקוח" },
  { key: "title", header: "נושא" },
  { key: "dueDate", header: "תאריך יעד" },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "description", header: "תיאור" },
];

export default function MarketerTasks() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">משימות</h1>
        <p className="text-muted-foreground">ניהול המשימות שלך</p>
      </div>
      <DataTable
        data={mockTasks}
        columns={columns}
        title="משימות"
        addLabel="משימה חדשה"
        onAdd={() => toast({ title: "הוספת משימה חדשה" })}
      />
    </div>
  );
}
