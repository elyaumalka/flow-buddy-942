import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockTasks = [
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">משימות</h1>
        <p className="text-muted-foreground">ניהול משימות אישיות ולקוחות</p>
      </div>
      <DataTable
        data={mockTasks}
        columns={columns}
        title="משימות"
        addLabel="משימה חדשה"
        onAdd={() => toast({ title: "הוספת משימה", description: "טופס הוספת משימה ייפתח בקרוב" })}
      />
    </div>
  );
}
