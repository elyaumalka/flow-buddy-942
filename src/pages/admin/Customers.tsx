import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerFormDialog, CustomerFormData } from "@/components/admin/CustomerFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "modules", header: "מודולים" },
  { key: "marketer_name", header: "משווק" },
  { key: "subscription", header: "מנוי", render: (item: any) => <StatusBadge status={item.subscription} /> },
  { key: "join_date", header: "הצטרפות", render: (item: any) => new Date(item.join_date).toLocaleDateString("he-IL") },
];

export default function AdminCustomers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update } = useSupabaseTable("customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: CustomerFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "הלקוח עודכן בהצלחה" });
    } else {
      await insert({ ...formData, created_by: user?.id });
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
