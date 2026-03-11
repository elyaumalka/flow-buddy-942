import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Save } from "lucide-react";

export interface MarketerFormData {
  name: string; phone: string; email: string; id_number: string;
  community: string; commission: string; coupon: string;
  partner_name: string; status: string;
}

const empty: MarketerFormData = { name: "", phone: "", email: "", id_number: "", community: "", commission: "", coupon: "", partner_name: "", status: "פעיל" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (MarketerFormData & { id?: string }) | null;
  onSave: (data: MarketerFormData, id?: string) => void;
}

export function MarketerFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<MarketerFormData>(empty);
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
  }, [initialData, open]);
  const set = (key: keyof MarketerFormData, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form, (initialData as any)?.id); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><Megaphone className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת משווק" : "משווק חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">שם מלא</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">טלפון</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">מייל</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">ת.ז.</Label><Input value={form.id_number} onChange={(e) => set("id_number", e.target.value)} dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">קהילה</Label><Input value={form.community} onChange={(e) => set("community", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">תנאי עמלה</Label><Input value={form.commission} onChange={(e) => set("commission", e.target.value)} placeholder="8% / ₪200 לכל לקוח" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">קוד קופון</Label><Input value={form.coupon} onChange={(e) => set("coupon", e.target.value)} dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">שותף מקושר</Label><Input value={form.partner_name} onChange={(e) => set("partner_name", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
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
