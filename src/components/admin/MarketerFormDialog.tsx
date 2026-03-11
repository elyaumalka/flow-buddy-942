import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface MarketerData {
  name: string;
  phone: string;
  email: string;
  id_number: string;
  community: string;
  commission: string;
  coupon: string;
  partner: string;
  clients: number;
  status: string;
}

const emptyMarketer: MarketerData = { name: "", phone: "", email: "", id_number: "", community: "", commission: "", coupon: "", partner: "", clients: 0, status: "פעיל" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: MarketerData | null;
  onSave: (data: MarketerData) => void;
}

export function MarketerFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<MarketerData>(emptyMarketer);
  const isEdit = !!initialData;

  useEffect(() => {
    setForm(initialData || emptyMarketer);
  }, [initialData, open]);

  const set = (key: keyof MarketerData, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת משווק" : "משווק חדש"}</DialogTitle>
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
              <Label>ת.ז.</Label>
              <Input value={form.id_number} onChange={(e) => set("id_number", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>קהילה</Label>
              <Input value={form.community} onChange={(e) => set("community", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>תנאי עמלה</Label>
              <Input value={form.commission} onChange={(e) => set("commission", e.target.value)} placeholder="8% / ₪200 לכל לקוח" />
            </div>
            <div className="space-y-2">
              <Label>קוד קופון</Label>
              <Input value={form.coupon} onChange={(e) => set("coupon", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>שותף מקושר</Label>
              <Input value={form.partner} onChange={(e) => set("partner", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
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
