import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Save } from "lucide-react";
import { PAYMENT_METHODS as BASE_PAYMENT_METHODS } from "@/lib/financeConstants";

export interface PaymentFormData {
  customer_id?: string | null;
  customer_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  invoice?: string;
  period_month?: string;
  period_start?: string | null;
  period_end?: string | null;
  billing_day?: number | null;
  notes?: string;
}

// Ensure the key methods בנקאי / מזומן / אשראי are present, alongside the shared list.
const PAYMENT_METHODS = Array.from(
  new Set<string>(["אשראי", "מזומן", "בנקאי", ...BASE_PAYMENT_METHODS])
);
const STATUSES = ["שולם", "ממתין", "נכשל", "מבוטל"];

const empty: PaymentFormData = {
  customer_id: null,
  customer_name: "",
  amount: 0,
  payment_date: new Date().toISOString().split("T")[0],
  payment_method: "בנקאי",
  status: "שולם",
  invoice: "",
  period_month: new Date().toISOString().slice(0, 7),
  period_start: null,
  period_end: null,
  billing_day: null,
  notes: "",
};

interface CustomerOption { id: string; name: string }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: (PaymentFormData & { id?: string }) | null;
  customers: CustomerOption[];
  onSave: (data: PaymentFormData, id?: string) => void;
}

export function PaymentFormDialog({ open, onOpenChange, initialData, customers, onSave }: Props) {
  const [form, setForm] = useState<PaymentFormData>(empty);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData as any;
      setForm({
        ...empty,
        ...rest,
        payment_date: rest.payment_date ? new Date(rest.payment_date).toISOString().split("T")[0] : empty.payment_date,
        period_start: rest.period_start ? String(rest.period_start).split("T")[0] : null,
        period_end: rest.period_end ? String(rest.period_end).split("T")[0] : null,
      });
    } else {
      setForm(empty);
    }
  }, [initialData, open]);

  const set = (k: keyof PaymentFormData, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const onCustomerChange = (id: string) => {
    const c = customers.find((x) => x.id === id);
    setForm((p) => ({ ...p, customer_id: id, customer_name: c?.name ?? p.customer_name }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id) return;
    onSave(form, (initialData as any)?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEdit ? "עריכת תשלום" : "תשלום חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="font-semibold text-xs">לקוח *</Label>
            <Select value={form.customer_id ?? ""} onValueChange={onCustomerChange}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
              <SelectContent className="rounded-xl max-h-72">
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סכום (₪) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} required className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">תאריך תשלום *</Label>
              <Input type="date" value={form.payment_date} onChange={(e) => set("payment_date", e.target.value)} required className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">אמצעי תשלום *</Label>
              <Select value={form.payment_method} onValueChange={(v) => set("payment_method", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">עבור חודש</Label>
              <Input type="month" value={form.period_month ?? ""} onChange={(e) => set("period_month", e.target.value)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">חשבונית</Label>
              <Input value={form.invoice ?? ""} onChange={(e) => set("invoice", e.target.value)} placeholder="מספר חשבונית" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">תקופה - מתאריך</Label>
              <Input type="date" value={form.period_start ?? ""} onChange={(e) => set("period_start", e.target.value || null)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">עד תאריך</Label>
              <Input type="date" value={form.period_end ?? ""} onChange={(e) => set("period_end", e.target.value || null)} className="rounded-xl" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">יום חיוב</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={form.billing_day ?? ""}
                onChange={(e) => set("billing_day", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="1-31"
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-xs">הערות</Label>
            <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={2} className="rounded-xl" placeholder="הערות פנימיות..." />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" disabled={!form.customer_id} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
              <Save className="h-4 w-4" />{isEdit ? "עדכן" : "הוסף תשלום"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
