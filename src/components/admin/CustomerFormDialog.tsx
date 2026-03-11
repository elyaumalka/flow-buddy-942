import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  community: string;
  marketer: string;
  modules: string;
  subscription: string;
  joinDate: string;
  lastLogin: string;
}

const emptyCustomer: CustomerData = { id: "", name: "", phone: "", email: "", community: "", marketer: "", modules: "", subscription: "פעיל", joinDate: new Date().toLocaleDateString("he-IL"), lastLogin: "" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CustomerData | null;
  onSave: (data: CustomerData) => void;
}

export function CustomerFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<CustomerData>(emptyCustomer);
  const isEdit = !!initialData;

  useEffect(() => {
    setForm(initialData || emptyCustomer);
  }, [initialData, open]);

  const set = (key: keyof CustomerData, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת לקוח" : "לקוח חדש"}</DialogTitle>
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
              <Label>קהילה</Label>
              <Input value={form.community} onChange={(e) => set("community", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>משווק</Label>
              <Input value={form.marketer} onChange={(e) => set("marketer", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>מודולים</Label>
              <Input value={form.modules} onChange={(e) => set("modules", e.target.value)} placeholder="הכנסות, הוצאות..." />
            </div>
            <div className="space-y-2">
              <Label>סטטוס מנוי</Label>
              <Select value={form.subscription} onValueChange={(v) => set("subscription", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                  <SelectItem value="מושהה">מושהה</SelectItem>
                </SelectContent>
              </Select>
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
