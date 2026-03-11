import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TicketFormDialog, TicketData } from "@/components/admin/TicketFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialTickets: TicketData[] = [
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
  const [data, setData] = useState(initialTickets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<TicketData | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: TicketData, index: number) => { setEditItem(item); setEditIndex(index); setDialogOpen(true); };
  const handleSave = (item: TicketData) => {
    if (editItem) {
      setData((d) => d.map((r, i) => (i === editIndex ? item : r)));
      toast({ title: "הפנייה עודכנה בהצלחה" });
    } else {
      const newId = `T${String(data.length + 1).padStart(3, "0")}`;
      setData((d) => [{ ...item, id: newId }, ...d]);
      toast({ title: "פנייה חדשה נוספה בהצלחה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">פניות ותקלות</h1>
        <p className="text-muted-foreground">ניהול פניות ותקלות לפי לקוח</p>
      </div>
      <DataTable data={data} columns={columns} title="פניות ותקלות" addLabel="פנייה חדשה" onAdd={handleAdd} onRowClick={handleEdit} />
      <TicketFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
