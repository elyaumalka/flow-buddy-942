import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Save } from "lucide-react";
import { ENTRY_TYPES, ENTRY_STATUSES, PAYMENT_METHODS } from "@/lib/financeConstants";
import { parseAmount } from "@/lib/format";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

const NEW_CATEGORY = "__new__";

export interface IncomeFormData {
  amount: number; income_date: string; type: string; category: string; status: string; payment_method: string; description: string; num_payments: number;
}

const empty: IncomeFormData = { amount: 0, income_date: new Date().toISOString().split("T")[0], type: "חודשי", category: "", status: "מאושר", payment_method: "ללא", description: "", num_payments: 1 };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (IncomeFormData & { id?: string }) | null;
  onSave: (data: IncomeFormData, id?: string) => void;
}

export function IncomeFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const { toast } = useToast();
  const { incomeCategories, createCategory } = useCategories();
  const [form, setForm] = useState<IncomeFormData>(empty);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
    setAddingCategory(false);
    setNewCategory("");
  }, [initialData, open]);
  const set = (key: keyof IncomeFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleCategoryChange = (v: string) => {
    if (v === NEW_CATEGORY) { setAddingCategory(true); return; }
    set("category", v);
  };

  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    await createCategory({ name, kind: "income" } as any);
    set("category", name);
    setAddingCategory(false);
    setNewCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast({ title: "יש לבחור קטגוריה", variant: "destructive" }); return; }
    onSave(form, (initialData as any)?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><TrendingUp className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת הכנסה" : "הכנסה חדשה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">סכום (₪)</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", parseAmount(e.target.value))} required className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">תאריך</Label><Input type="date" value={form.income_date} onChange={(e) => set("income_date", e.target.value)} className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סוג</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{ENTRY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">קטגוריה</Label>
              <Select value={form.category || undefined} onValueChange={handleCategoryChange}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {incomeCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value={NEW_CATEGORY}>➕ קטגוריה חדשה</SelectItem>
                </SelectContent>
              </Select>
              {addingCategory && (
                <div className="flex gap-2 pt-1">
                  <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="שם קטגוריה" className="rounded-xl" />
                  <Button type="button" onClick={handleCreateCategory} className="rounded-xl gradient-primary border-0 shrink-0">צור</Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{ENTRY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">אופן ביצוע</Label>
              <Select value={form.payment_method} onValueChange={(v) => set("payment_method", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="font-semibold text-xs">מספר תשלומים</Label><Input type="number" min={1} value={form.num_payments} onChange={(e) => set("num_payments", Number(e.target.value))} className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2 col-span-2"><Label className="font-semibold text-xs">תיאור</Label><Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="פרטים נוספים..." className="rounded-xl" /></div>
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5"><Save className="h-4 w-4" />{isEdit ? "עדכן" : "הוסף"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
