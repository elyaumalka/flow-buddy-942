import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeadphonesIcon, Save } from "lucide-react";

export interface TicketFormData {
  customer: string; subject: string; description: string;
  priority: string; status: string;
}

const empty: TicketFormData = { customer: "", subject: "", description: "", priority: "רגיל", status: "חדש" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (TicketFormData & { id?: string }) | null;
  onSave: (data: TicketFormData, id?: string) => void;
}

export function TicketFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<TicketFormData>(empty);
  const isEdit = !!initialData;
  useEffect(() => {
    if (initialData) { const { id, ...rest } = initialData as any; setForm({ ...empty, ...rest }); }
    else setForm(empty);
  }, [initialData, open]);
  const set = (key: keyof TicketFormData, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form, (initialData as any)?.id); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm"><HeadphonesIcon className="h-4 w-4 text-primary-foreground" /></div>
            {isEdit ? "עריכת פנייה" : "פנייה חדשה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">שם לקוח</Label><Input value={form.customer} onChange={(e) => set("customer", e.target.value)} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">נושא</Label><Input value={form.subject} onChange={(e) => set("subject", e.target.value)} required className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">דחיפות</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="דחוף">דחוף</SelectItem><SelectItem value="רגיל">רגיל</SelectItem><SelectItem value="נמוך">נמוך</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="חדש">חדש</SelectItem><SelectItem value="בטיפול">בטיפול</SelectItem><SelectItem value="ממתין">ממתין</SelectItem><SelectItem value="הושלם">הושלם</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label className="font-semibold text-xs">תיאור</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="rounded-xl" /></div>
          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5"><Save className="h-4 w-4" />{isEdit ? "עדכן" : "הוסף"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
