import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarketerFormDialog, MarketerData } from "@/components/admin/MarketerFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialMarketers: MarketerData[] = [
  { name: "אבי ישראלי", phone: "050-5551234", email: "avi@example.com", id_number: "012345678", community: "קהילת שלום", commission: "8%", coupon: "AVI2026", partner: "ראובן גולד", clients: 15, status: "פעיל" },
  { name: "מיכל דוד", phone: "052-5559876", email: "michal@example.com", id_number: "098765432", community: "קהילת אור", commission: "₪200/לקוח", coupon: "MICHAL10", partner: "שמעון כסף", clients: 12, status: "פעיל" },
  { name: "נתן ברק", phone: "054-5554567", email: "natan@example.com", id_number: "056789012", community: "קהילת חסד", commission: "5% + ₪100", coupon: "NATAN5", partner: "ראובן גולד", clients: 8, status: "פעיל" },
];

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "commission", header: "תנאי עמלה" },
  { key: "coupon", header: "קוד קופון" },
  { key: "partner", header: "שותף מקושר" },
  { key: "clients", header: "לקוחות" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminMarketers() {
  const { toast } = useToast();
  const [data, setData] = useState(initialMarketers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<MarketerData | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: MarketerData, index: number) => { setEditItem(item); setEditIndex(index); setDialogOpen(true); };
  const handleSave = (item: MarketerData) => {
    if (editItem) {
      setData((d) => d.map((r, i) => (i === editIndex ? item : r)));
      toast({ title: "המשווק עודכן בהצלחה" });
    } else {
      setData((d) => [{ ...item, clients: 0 }, ...d]);
      toast({ title: "משווק חדש נוסף בהצלחה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול משווקים</h1>
        <p className="text-muted-foreground">ניהול משווקים, קודי קופון ועמלות</p>
      </div>
      <DataTable data={data} columns={columns} title="משווקים" addLabel="משווק חדש" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit} />
      <MarketerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
