import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { PaymentFormDialog, PaymentFormData } from "@/components/admin/PaymentFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const columns = [
  { key: "customer_name", header: "שם לקוח" },
  { key: "payment_date", header: "תאריך חיוב", render: (item: any) => new Date(item.payment_date).toLocaleDateString("he-IL") },
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "payment_method", header: "אמצעי תשלום", render: (item: any) => item.payment_method || "-" },
  { key: "period_month", header: "עבור חודש", render: (item: any) => item.period_month || "-" },
  { key: "invoice", header: "חשבונית", render: (item: any) => item.invoice || "-" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "amount", label: "סכום חיוב", type: "number" },
  { key: "payment_method", label: "אמצעי תשלום", type: "select", options: ["מזומן", "העברה בנקאית", "אשראי", "צ'ק", "הוראת קבע", "ביט", "פייבוקס"] },
  { key: "period_month", label: "עבור חודש (YYYY-MM)", type: "text" },
  { key: "invoice", label: "חשבונית", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["שולם", "ממתין", "נכשל", "מבוטל"] },
];

const filters = [
  { key: "status", label: "סטטוס" },
  { key: "payment_method", label: "אמצעי תשלום" },
  { key: "period_month", label: "עבור חודש" },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, remove, bulkUpdate, bulkRemove } = useSupabaseTable("payments");
  const { data: customers } = useSupabaseTable<any>("customers");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} תשלומים עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} תשלומים נמחקו` });
  };

  const handleSave = async (form: PaymentFormData, id?: string) => {
    const payload: any = {
      ...form,
      period_start: form.period_start || null,
      period_end: form.period_end || null,
    };
    if (id) {
      await update({ id, ...payload });
      toast({ title: "התשלום עודכן" });
    } else {
      await insert({ ...payload, created_by: user?.id });
      toast({ title: "תשלום נוסף בהצלחה" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    await remove(deleteItem.id);
    toast({ title: "התשלום נמחק" });
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">תשלומי מנויים</h1>
        <p className="text-muted-foreground">ניהול תשלומי מנויים, מזומן והעברות בנקאיות</p>
      </div>

      <DataTable
        data={data}
        columns={columns}
        title="תשלומים"
        addLabel="תשלום חדש"
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        onRowClick={(item) => { setEditing(item); setFormOpen(true); }}
        onExport={() => toast({ title: "ייצוא" })}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        filters={filters}
        extraRowActions={[{ label: "מחק", icon: Trash2, onClick: (it) => setDeleteItem(it) }]}
      />

      <PaymentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing}
        customers={(customers || []).map((c: any) => ({ id: c.id, name: c.name }))}
        onSave={handleSave}
      />

      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />

      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת תשלום</AlertDialogTitle>
            <AlertDialogDescription>
              האם למחוק את התשלום של {deleteItem?.customer_name} בסך ₪{Number(deleteItem?.amount || 0).toLocaleString()}? פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
