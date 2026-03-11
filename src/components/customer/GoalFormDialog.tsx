import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Save } from "lucide-react";

export interface GoalFormData {
  title: string; current_amount: number; target_amount: number; goal_type: string;
}

const empty: GoalFormData = { title: "", current_amount: 0, target_amount: 0, goal_type: "income" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (GoalFormData & { id?: string }) | null;
  onSave: (data: GoalFormData, id?: string) => void;
}

export function GoalFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<GoalFormData>(empty);
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
  }, [initialData, open]);
  const set = (key: keyof GoalFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form, (initialData as any)?.id); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><Target className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת יעד" : "יעד חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2"><Label className="font-semibold text-xs">כותרת</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required className="rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">סכום נוכחי (₪)</Label><Input type="number" value={form.current_amount} onChange={(e) => set("current_amount", Number(e.target.value))} className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">יעד (₪)</Label><Input type="number" value={form.target_amount} onChange={(e) => set("target_amount", Number(e.target.value))} required className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סוג</Label>
              <Select value={form.goal_type} onValueChange={(v) => set("goal_type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="income">הכנסות</SelectItem><SelectItem value="expense">הוצאות</SelectItem><SelectItem value="savings">חיסכון</SelectItem></SelectContent>
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
