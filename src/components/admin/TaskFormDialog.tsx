import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TaskData {
  title: string;
  customer: string;
  dueDate: string;
  priority: string;
  status: string;
  description: string;
}

const emptyTask: TaskData = { title: "", customer: "", dueDate: "", priority: "רגיל", status: "חדש", description: "" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TaskData | null;
  onSave: (data: TaskData) => void;
}

export function TaskFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<TaskData>(emptyTask);
  const isEdit = !!initialData;

  useEffect(() => {
    setForm(initialData || emptyTask);
  }, [initialData, open]);

  const set = (key: keyof TaskData, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "עריכת משימה" : "משימה חדשה"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>כותרת משימה</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>לקוח / איש קשר</Label>
              <Input value={form.customer} onChange={(e) => set("customer", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>תאריך יעד</Label>
              <Input value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} placeholder="DD/MM/YYYY" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>דחיפות</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="דחוף">דחוף</SelectItem>
                  <SelectItem value="רגיל">רגיל</SelectItem>
                  <SelectItem value="נמוך">נמוך</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
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
