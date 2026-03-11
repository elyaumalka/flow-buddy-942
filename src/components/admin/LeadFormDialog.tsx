import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Save } from "lucide-react";

export interface LeadFormData {
  name: string; phone: string; email: string; city: string;
  community: string; status: string; source: string; marketer_name: string;
}

const emptyLead: LeadFormData = { name: "", phone: "", email: "", city: "", community: "", status: "חדש", source: "", marketer_name: "" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: (LeadFormData & { id?: string }) | null;
  onSave: (data: LeadFormData, id?: string) => void;
}

export function LeadFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<LeadFormData>(emptyLead);
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData as any;
      setForm({ ...emptyLead, ...rest });
    } else {
      setForm(emptyLead);
    }
  }, [initialData, open]);

  const set = (key: keyof LeadFormData, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, (initialData as any)?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <UserPlus className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEdit ? "עריכת ליד" : "ליד חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">שם מלא</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">טלפון</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" required className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">מייל</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">כתובת</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">קהילה</Label><Input value={form.community} onChange={(e) => set("community", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="חדש">חדש</SelectItem>
                  <SelectItem value="בטיפול">בטיפול</SelectItem>
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="הושלם">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">מקור הגעה</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר מקור" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="אתר">אתר</SelectItem>
                  <SelectItem value="טלפון">טלפון</SelectItem>
                  <SelectItem value="הפניה">הפניה</SelectItem>
                  <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="font-semibold text-xs">משווק מקושר</Label><Input value={form.marketer_name} onChange={(e) => set("marketer_name", e.target.value)} className="rounded-xl" /></div>
          </div>
          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
              <Save className="h-4 w-4" />
              {isEdit ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
