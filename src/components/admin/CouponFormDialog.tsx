import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Save, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CouponFormData {
  name: string;
  code: string;
  price: number;
  expires_at: string | null;
  status: string;
  notes: string;
}

const empty: CouponFormData = { name: "", code: "", price: 0, expires_at: null, status: "פעיל", notes: "" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSave: (data: CouponFormData, id?: string) => void;
}

export function CouponFormDialog({ open, onOpenChange, initialData, onSave }: Props) {
  const [form, setForm] = useState<CouponFormData>(empty);
  const [noExpiry, setNoExpiry] = useState(true);
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        code: initialData.code ?? "",
        price: Number(initialData.price ?? 0),
        expires_at: initialData.expires_at ?? null,
        status: initialData.status ?? "פעיל",
        notes: initialData.notes ?? "",
      });
      setNoExpiry(!initialData.expires_at);
    } else {
      setForm(empty);
      setNoExpiry(true);
    }
  }, [initialData, open]);

  const set = <K extends keyof CouponFormData>(k: K, v: CouponFormData[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, expires_at: noExpiry ? null : form.expires_at }, initialData?.id);
    onOpenChange(false);
  };

  const generateCode = () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    set("code", code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <Ticket className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEdit ? "עריכת קופון" : "קופון חדש"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-xs">שם הקופון</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">קוד קופון</Label>
              <div className="flex gap-1">
                <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} required dir="ltr" className="rounded-xl uppercase" />
                <Button type="button" variant="outline" size="sm" onClick={generateCode} className="rounded-xl shrink-0">צור</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">מחיר (₪)</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", Number(e.target.value))} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-xs">סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="לא פעיל">לא פעיל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/50 p-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs">ללא תאריך תפוגה</Label>
              <Switch checked={noExpiry} onCheckedChange={setNoExpiry} />
            </div>
            {!noExpiry && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start rounded-xl", !form.expires_at && "text-muted-foreground")}>
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {form.expires_at ? format(new Date(form.expires_at), "dd/MM/yyyy") : "בחר תאריך תפוגה"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expires_at ? new Date(form.expires_at) : undefined}
                    onSelect={(d) => set("expires_at", d ? d.toISOString() : null)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-xs">הערות</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="rounded-xl" />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
              <Save className="h-4 w-4" />{isEdit ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
