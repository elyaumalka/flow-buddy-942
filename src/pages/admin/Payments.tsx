import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { PaymentFormDialog, PaymentFormData } from "@/components/admin/PaymentFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, Wallet, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/financeConstants";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAYMENT_METHOD_OPTIONS = Array.from(new Set<string>(["אשראי", "מזומן", "בנקאי", ...PAYMENT_METHODS]));

const columns = [
  { key: "customer_code", header: "קוד", render: (item: any) => item.customer_code ?? "-" },
  { key: "customer_name", header: "שם לקוח" },
  { key: "payment_date", header: "תאריך חיוב", render: (item: any) => new Date(item.payment_date).toLocaleDateString("he-IL") },
  { key: "amount", header: "סכום", render: (item: any) => formatCurrency(item.amount) },
  { key: "payment_method", header: "אמצעי תשלום", render: (item: any) => item.payment_method || "-" },
  { key: "billing_day", header: "יום חיוב", render: (item: any) => item.billing_day ?? "-" },
  { key: "period_month", header: "עבור חודש", render: (item: any) => item.period_month || "-" },
  { key: "invoice", header: "חשבונית", render: (item: any) => item.invoice || "-" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "amount", label: "סכום חיוב", type: "number" },
  { key: "payment_method", label: "אמצעי תשלום", type: "select", options: PAYMENT_METHOD_OPTIONS },
  { key: "billing_day", label: "יום חיוב", type: "number" },
  { key: "period_month", label: "עבור חודש (YYYY-MM)", type: "text" },
  { key: "invoice", label: "חשבונית", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["שולם", "ממתין", "נכשל", "מבוטל"] },
];

const filters = [
  { key: "status", label: "סטטוס" },
  { key: "payment_method", label: "אמצעי תשלום", options: PAYMENT_METHOD_OPTIONS },
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

  // "קופה" - charge by credit
  const [cashOpen, setCashOpen] = useState(false);
  const [cashName, setCashName] = useState("");
  const [cashAmount, setCashAmount] = useState<number>(0);

  const handleCashCharge = async () => {
    if (!cashName.trim() || !cashAmount) {
      toast({ title: "יש להזין שם לקוח וסכום", variant: "destructive" });
      return;
    }
    await insert({
      customer_name: cashName.trim(),
      amount: cashAmount,
      payment_method: "אשראי",
      status: "שולם",
      payment_date: new Date().toISOString().split("T")[0],
      period_month: new Date().toISOString().slice(0, 7),
      created_by: user?.id,
    });
    toast({ title: "חיוב באשראי נרשם בקופה", description: `${cashName} · ${formatCurrency(cashAmount)}` });
    setCashName("");
    setCashAmount(0);
    setCashOpen(false);
  };

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
      billing_day: form.billing_day ?? null,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">תשלומי מנויים</h1>
          <p className="text-muted-foreground">ניהול תשלומי מנויים, מזומן והעברות בנקאיות</p>
        </div>
        <Button onClick={() => setCashOpen(true)} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
          <Wallet className="h-4 w-4" />
          קופה - חיוב באשראי
        </Button>
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

      <Dialog open={cashOpen} onOpenChange={setCashOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md rounded-2xl border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              קופה - חיוב באשראי
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">שם לקוח *</Label>
              <Input value={cashName} onChange={(e) => setCashName(e.target.value)} placeholder="שם הלקוח" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סכום (₪) *</Label>
              <Input type="number" value={cashAmount || ""} onChange={(e) => setCashAmount(Number(e.target.value))} className="rounded-xl" dir="ltr" />
            </div>
            <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setCashOpen(false)} className="rounded-xl">ביטול</Button>
              <Button onClick={handleCashCharge} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
                <Save className="h-4 w-4" /> חייב באשראי
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
