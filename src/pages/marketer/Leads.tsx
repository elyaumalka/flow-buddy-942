import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockLeads = [
  { name: "אברהם כהן", phone: "050-1234567", email: "a@example.com", city: "ירושלים", community: "קהילת שלום", status: "חדש", notes: "מעוניין בחבילה בסיסית" },
  { name: "שרה לוי", phone: "052-7654321", email: "s@example.com", city: "בני ברק", community: "קהילת אור", status: "בטיפול", notes: "ביקש לחזור אליו" },
  { name: "משה דוד", phone: "054-9876543", email: "m@example.com", city: "תל אביב", community: "קהילת חסד", status: "ממתין", notes: "" },
  { name: "רחל אברהם", phone: "053-1112233", email: "r@example.com", city: "חיפה", community: "קהילת שלום", status: "חדש", notes: "הגיע דרך קופון" },
];

const columns = [
  { key: "name", header: "שם הליד" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "city", header: "כתובת" },
  { key: "community", header: "קהילה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
  { key: "notes", header: "הערות" },
];

export default function MarketerLeads() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">לידים שלי</h1>
        <p className="text-muted-foreground">ניהול הלידים שהגיעו דרכך</p>
      </div>
      <DataTable
        data={mockLeads}
        columns={columns}
        title="לידים"
        addLabel="ליד חדש"
        onAdd={() => toast({ title: "הוספת ליד חדש" })}
        searchPlaceholder="חיפוש לפי שם, טלפון..."
      />
    </div>
  );
}
