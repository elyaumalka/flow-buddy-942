import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Save } from "lucide-react";

export interface TaskData {
  title: string; customer: string; dueDate: string;
  priority: string; status: string; description: string;
}

const emptyTask: TaskData = { title: "", customer: "", dueDate: "", priority: "רגיל", status: "חדש", description: "" };

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData?: TaskData | null; onSave: (data: TaskData) => void;
}

export function TaskFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<TaskData>(emptyTask);
  const isEdit = !!initialData;
  useEffect(() => { setForm(initialData || emptyTask); }, [initialData, open]);
  const set = (key: keyof TaskData, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEdit ? "עריכת משימה" : "משימה חדשה"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2"><Label className="font-semibold text-xs">כותרת משימה</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required className="rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="font-semibold text-xs">לקוח / איש קשר</Label><Input value={form.customer} onChange={(e) => set("customer", e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">תאריך יעד</Label><Input value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} placeholder="DD/MM/YYYY" dir="ltr" className="rounded-xl" /></div>
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
