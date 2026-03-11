import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LeadData {
  name: string;
  phone: string;
  email: string;
  city: string;
  community: string;
  status: string;
  source: string;
  marketer: string;
  date: string;
}

const emptyLead: LeadData = { name: "", phone: "", email: "", city: "", community: "", status: "חדש", source: "", marketer: "", date: new Date().toLocaleDateString("he-IL") };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LeadData | null;
  onSave: (data: LeadData) => void;
}

export function LeadFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<LeadData>(emptyLead);
  const isEdit = !!initialData;

  useEffect(() => {
    setForm(initialData || emptyLead);
  }, [initialData, open]);

  const set = (key: keyof LeadData, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת ליד" : "ליד חדש"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" required />
            </div>
            <div className="space-y-2">
              <Label>מייל</Label>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>קהילה</Label>
              <Input value={form.community} onChange={(e) => set("community", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="חדש">חדש</SelectItem>
                  <SelectItem value="בטיפול">בטיפול</SelectItem>
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="הושלם">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>מקור הגעה</Label>
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue placeholder="בחר מקור" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="אתר">אתר</SelectItem>
                  <SelectItem value="טלפון">טלפון</SelectItem>
                  <SelectItem value="הפניה">הפניה</SelectItem>
                  <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>משווק מקושר</Label>
              <Input value={form.marketer} onChange={(e) => set("marketer", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit">{isEdit ? "עדכן" : "הוסף"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
