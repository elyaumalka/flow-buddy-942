import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarketerFormDialog, MarketerFormData } from "@/components/admin/MarketerFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "community", header: "קהילה" },
  { key: "commission", header: "תנאי עמלה" },
  { key: "coupon", header: "קוד קופון" },
  { key: "partner_name", header: "שותף מקושר" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminMarketers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update } = useSupabaseTable("marketers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: MarketerFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "המשווק עודכן בהצלחה" });
    } else {
      await insert({ ...formData, created_by: user?.id });
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
