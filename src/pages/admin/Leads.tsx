import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadFormDialog, LeadData } from "@/components/admin/LeadFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialLeads: LeadData[] = [
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
  const [data, setData] = useState(initialLeads);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<LeadData | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: LeadData, index: number) => { setEditItem(item); setEditIndex(index); setDialogOpen(true); };
  const handleSave = (item: LeadData) => {
    if (editItem) {
      setData((d) => d.map((r, i) => (i === editIndex ? item : r)));
      toast({ title: "הליד עודכן בהצלחה" });
    } else {
      setData((d) => [{ ...item, date: new Date().toLocaleDateString("he-IL") }, ...d]);
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
