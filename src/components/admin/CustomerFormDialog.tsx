import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Save } from "lucide-react";

export interface CustomerFormData {
  name: string; phone: string; email: string;
  community: string; marketer_name: string; subscription: string;
  subscription_months: string; subscription_end: string; credit_card_last4: string;
}

const empty: CustomerFormData = { name: "", phone: "", email: "", community: "", marketer_name: "", subscription: "פעיל", subscription_months: "", subscription_end: "", credit_card_last4: "" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (CustomerFormData & { id?: string }) | null;
  onSave: (data: CustomerFormData, id?: string) => void;
}

export function CustomerFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<CustomerFormData>(empty);
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
  }, [initialData, open]);
  const set = (key: keyof CustomerFormData, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      subscription_months: form.subscription_months === "" ? null : Number(form.subscription_months),
      subscription_end: form.subscription_end === "" ? null : form.subscription_end,
      credit_card_last4: form.credit_card_last4 === "" ? null : form.credit_card_last4,
    };
    onSave(payload, (initialData as any)?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><UserCheck className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת לקוח" : "לקוח חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">שם מלא</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">טלפון</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">מייל</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">קהילה</Label><Input value={form.community} onChange={(e) => set("community", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">משווק</Label><Input value={form.marketer_name} onChange={(e) => set("marketer_name", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">מספר חודשי מנוי</Label><Input value={form.subscription_months} onChange={(e) => set("subscription_months", e.target.value)} type="number" min={0} dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">תוקף מנוי</Label><Input value={form.subscription_end} onChange={(e) => set("subscription_end", e.target.value)} type="date" dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">ספרות אחרונות אשראי</Label><Input value={form.credit_card_last4} onChange={(e) => set("credit_card_last4", e.target.value)} maxLength={4} dir="ltr" placeholder="1234" className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס מנוי</Label>
              <Select value={form.subscription} onValueChange={(v) => set("subscription", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                  <SelectItem value="מושהה">מושהה</SelectItem>
                </SelectContent>
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
