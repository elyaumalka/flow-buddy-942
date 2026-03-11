import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Save } from "lucide-react";

export interface IncomeFormData {
  amount: number; income_date: string; type: string; category: string; status: string;
}

const empty: IncomeFormData = { amount: 0, income_date: new Date().toISOString().split("T")[0], type: "חודשי", category: "", status: "מאושר" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (IncomeFormData & { id?: string }) | null;
  onSave: (data: IncomeFormData, id?: string) => void;
}

export function IncomeFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<IncomeFormData>(empty);
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
  }, [initialData, open]);
  const set = (key: keyof IncomeFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form, (initialData as any)?.id); onOpenChange(false); };

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
            <div className="space-y-2"><Label className="font-semibold text-xs">סכום (₪)</Label><Input type="number" value={form.amount} onChange={(e) => set("amount", Number(e.target.value))} required className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">תאריך</Label><Input type="date" value={form.income_date} onChange={(e) => set("income_date", e.target.value)} className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סוג</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="חודשי">חודשי</SelectItem><SelectItem value="חד פעמי">חד פעמי</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="font-semibold text-xs">קטגוריה</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="משכורת, פרילנס..." className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="מאושר">מאושר</SelectItem><SelectItem value="לאישור">לאישור</SelectItem><SelectItem value="צפוי">צפוי</SelectItem></SelectContent>
              </Select>
            </div>
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
