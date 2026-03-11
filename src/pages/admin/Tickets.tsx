import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockTickets = [
  { id: "T001", customer: "יוסי כהן", subject: "בעיית חיוב", openDate: "10/03/2026", status: "חדש", priority: "דחוף" },
  { id: "T002", customer: "רחל לוי", subject: "שינוי חבילה", openDate: "09/03/2026", status: "בטיפול", priority: "רגיל" },
  { id: "T003", customer: "דוד אברהם", subject: "שאלה על דוח", openDate: "08/03/2026", status: "הושלם", priority: "נמוך" },
  { id: "T004", customer: "שרה מזרחי", subject: "בקשת החזר", openDate: "07/03/2026", status: "ממתין", priority: "רגיל" },
  { id: "T005", customer: "נועה פרידמן", subject: "תקלה בכניסה", openDate: "06/03/2026", status: "חדש", priority: "דחוף" },
];

const columns = [
  { key: "id", header: "מזהה" },
  { key: "customer", header: "שם לקוח" },
  { key: "subject", header: "נושא" },
  { key: "openDate", header: "תאריך פתיחה" },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminTickets() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">פניות ותקלות</h1>
        <p className="text-muted-foreground">ניהול פניות ותקלות לפי לקוח</p>
      </div>
      <DataTable
        data={mockTickets}
        columns={columns}
        title="פניות ותקלות"
        addLabel="פנייה חדשה"
        onAdd={() => toast({ title: "פנייה חדשה", description: "טופס פנייה חדשה ייפתח בקרוב" })}
      />
    </div>
  );
}
