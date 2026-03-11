import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TicketFormDialog, TicketFormData } from "@/components/admin/TicketFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "customer", header: "שם לקוח" },
  { key: "subject", header: "נושא" },
  { key: "created_at", header: "תאריך פתיחה", render: (item: any) => new Date(item.created_at).toLocaleDateString("he-IL") },
  { key: "priority", header: "דחיפות", render: (item: any) => <StatusBadge status={item.priority} /> },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminTickets() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update } = useSupabaseTable("tickets");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: TicketFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "הפנייה עודכנה בהצלחה" });
    } else {
      await insert({ ...formData, created_by: user?.id });
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
