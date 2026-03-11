import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockLeads = [
  { name: "אברהם כהן", phone: "050-1234567", email: "a@example.com", city: "ירושלים", community: "קהילת שלום", status: "חדש", source: "אתר", marketer: "אבי ישראלי", date: "10/03/2026" },
  { name: "שרה לוי", phone: "052-7654321", email: "s@example.com", city: "בני ברק", community: "קהילת אור", status: "בטיפול", source: "טלפון", marketer: "מיכל דוד", date: "08/03/2026" },
  { name: "משה דוד", phone: "054-9876543", email: "m@example.com", city: "תל אביב", community: "קהילת חסד", status: "ממתין", source: "הפניה", marketer: "נתן ברק", date: "05/03/2026" },
  { name: "רחל אברהם", phone: "053-1112233", email: "r@example.com", city: "חיפה", community: "קהילת שלום", status: "חדש", source: "אתר", marketer: "אבי ישראלי", date: "11/03/2026" },
  { name: "יעקב מזרחי", phone: "058-4445566", email: "y@example.com", city: "אשדוד", community: "קהילת אור", status: "הושלם", source: "פייסבוק", marketer: "מיכל דוד", date: "01/03/2026" },
];

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "city", header: "כתובת" },
  { key: "community", header: "קהילה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
  { key: "source", header: "מקור הגעה" },
  { key: "marketer", header: "משווק מקושר" },
  { key: "date", header: "תאריך הצטרפות" },
];

export default function AdminLeads() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול לידים</h1>
        <p className="text-muted-foreground">ניהול וטיפול בלידים שמגיעים למערכת</p>
      </div>
      <DataTable
        data={mockLeads}
        columns={columns}
        title="לידים"
        addLabel="ליד חדש"
        onAdd={() => toast({ title: "הוספת ליד", description: "טופס הוספת ליד ייפתח בקרוב" })}
        onExport={() => toast({ title: "ייצוא", description: "הקובץ מוכן להורדה" })}
        searchPlaceholder="חיפוש לפי שם, טלפון, מייל..."
      />
    </div>
  );
}
