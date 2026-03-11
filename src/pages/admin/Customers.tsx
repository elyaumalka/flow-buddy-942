import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerFormDialog, CustomerData } from "@/components/admin/CustomerFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialCustomers: CustomerData[] = [
  { id: "C001", name: "יוסי כהן", phone: "050-1112233", email: "yossi@example.com", community: "קהילת שלום", marketer: "אבי ישראלי", modules: "הכנסות, הוצאות", subscription: "פעיל", joinDate: "01/01/2026", lastLogin: "10/03/2026" },
  { id: "C002", name: "רחל לוי", phone: "052-4445566", email: "rachel@example.com", community: "קהילת אור", marketer: "מיכל דוד", modules: "הכל", subscription: "פעיל", joinDate: "15/02/2026", lastLogin: "09/03/2026" },
  { id: "C003", name: "דוד אברהם", phone: "054-7778899", email: "david@example.com", community: "קהילת חסד", marketer: "נתן ברק", modules: "הכנסות", subscription: "לא פעיל", joinDate: "20/11/2025", lastLogin: "01/02/2026" },
];

const columns = [
  { key: "id", header: "מזהה" },
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "modules", header: "מודולים" },
  { key: "marketer", header: "משווק" },
  { key: "subscription", header: "מנוי", render: (item: any) => <StatusBadge status={item.subscription} /> },
  { key: "joinDate", header: "הצטרפות" },
  { key: "lastLogin", header: "כניסה אחרונה" },
];

export default function AdminCustomers() {
  const { toast } = useToast();
  const [data, setData] = useState(initialCustomers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomerData | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: CustomerData, index: number) => { setEditItem(item); setEditIndex(index); setDialogOpen(true); };
  const handleSave = (item: CustomerData) => {
    if (editItem) {
      setData((d) => d.map((r, i) => (i === editIndex ? item : r)));
      toast({ title: "הלקוח עודכן בהצלחה" });
    } else {
      const newId = `C${String(data.length + 1).padStart(3, "0")}`;
      setData((d) => [{ ...item, id: newId, joinDate: new Date().toLocaleDateString("he-IL"), lastLogin: "" }, ...d]);
      toast({ title: "לקוח חדש נוסף בהצלחה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול לקוחות</h1>
        <p className="text-muted-foreground">ניהול לקוחות משלמים במערכת</p>
      </div>
      <DataTable data={data} columns={columns} title="לקוחות" addLabel="לקוח חדש" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit} />
      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
