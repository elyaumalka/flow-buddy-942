import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Save } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export interface GoalFormData {
  title: string; current_amount: number; target_amount: number; goal_type: string; duration_months: number;
  category?: string | null;
  savings_location?: string | null; has_commission?: boolean;
  target_date?: string | null; savings_categories?: string[] | null;
}

const empty: GoalFormData = {
  title: "", current_amount: 0, target_amount: 0, goal_type: "savings", duration_months: 1,
  category: "", savings_location: "", has_commission: false, target_date: null, savings_categories: [],
};

const GOAL_TYPES = [
  { value: "savings", label: "חיסכון" },
  { value: "reduce_expenses", label: "הקטנת הוצאות" },
  { value: "income", label: "הכנסה" },
];

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (GoalFormData & { id?: string }) | null;
  onSave: (data: GoalFormData, id?: string) => void;
}

export function GoalFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<GoalFormData>(empty);
  const { incomeCategories, expenseCategories } = useCategories();
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest, savings_categories: rest.savings_categories || [] }); }
    else setForm(empty);
  }, [initialData, open]);

  const set = (key: keyof GoalFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const isSavings = form.goal_type === "savings";
  const isReduce = form.goal_type === "reduce_expenses";

  const allCategories = Array.from(new Set([...incomeCategories, ...expenseCategories]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: GoalFormData = { ...form };
    if (!isSavings) { payload.savings_location = null; payload.has_commission = false; }
    if (!isReduce) { payload.target_date = null; }
    if (isReduce) { payload.current_amount = 0; }
    onSave(payload, (initialData as any)?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><Target className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת יעד" : "יעד חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2"><Label className="font-semibold text-xs">שם היעד</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required className="rounded-xl" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סוג</Label>
              <Select value={form.goal_type} onValueChange={(v) => set("goal_type", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {GOAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">קטגוריה</Label>
              <Select value={form.category || ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {(isReduce ? expenseCategories : allCategories).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">משך (חודשים)</Label>
              <Input type="number" min={1} step={1} value={form.duration_months} onChange={(e) => set("duration_months", Math.max(1, Number(e.target.value)))} required className="rounded-xl" dir="ltr" />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs">{isReduce ? "כמה להקטין (₪)" : "יעד (₪)"}</Label>
              <Input type="number" value={form.target_amount} onChange={(e) => set("target_amount", Number(e.target.value))} required className="rounded-xl" dir="ltr" />
            </div>

            {!isReduce && (
              <div className="space-y-2 col-span-2">
                <Label className="font-semibold text-xs">סכום נוכחי (₪)</Label>
                <Input type="number" value={form.current_amount} onChange={(e) => set("current_amount", Number(e.target.value))} className="rounded-xl" dir="ltr" />
              </div>
            )}

            {isReduce && (
              <div className="space-y-2 col-span-2">
                <Label className="font-semibold text-xs">תאריך יעד</Label>
                <Input type="date" value={form.target_date || ""} onChange={(e) => set("target_date", e.target.value)} required className="rounded-xl" dir="ltr" />
              </div>
            )}
          </div>

          {isSavings && (
            <div className="space-y-4 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-2">
                <Label className="font-semibold text-xs">מיקום החיסכון</Label>
                <Input
                  value={form.savings_location || ""}
                  onChange={(e) => set("savings_location", e.target.value)}
                  placeholder="לדוגמה: בנק הפועלים, מזומן בבית, קופת גמל…"
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs">מקבל עמלה?</Label>
                <Switch checked={!!form.has_commission} onCheckedChange={(v) => set("has_commission", v)} />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5"><Save className="h-4 w-4" />{isEdit ? "עדכן" : "הוסף"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
