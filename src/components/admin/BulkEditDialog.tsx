import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save } from "lucide-react";

export type BulkField =
  | { key: string; label: string; type: "text" | "number" }
  | { key: string; label: string; type: "select"; options: string[] };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: BulkField[];
  count: number;
  onSave: (updates: Record<string, any>) => Promise<void> | void;
}

export function BulkEditDialog({ open, onOpenChange, fields, count, onSave }: Props) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setEnabled({}); setValues({}); }
  }, [open]);

  const toggle = (k: string) => setEnabled((p) => ({ ...p, [k]: !p[k] }));
  const setVal = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Record<string, any> = {};
    for (const f of fields) {
      if (enabled[f.key]) {
        let v = values[f.key];
        if (f.type === "number") v = v === "" || v == null ? null : Number(v);
        updates[f.key] = v ?? null;
      }
    }
    if (Object.keys(updates).length === 0) { onOpenChange(false); return; }
    setSaving(true);
    try { await onSave(updates); onOpenChange(false); } finally { setSaving(false); }
  };

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <Pencil className="h-4 w-4 text-primary-foreground" />
            </div>
            עריכה קבוצתית
          </DialogTitle>
          <DialogDescription>
            סמן את השדות שברצונך לעדכן עבור <b className="text-primary">{count}</b> רשומות נבחרות. שדות שלא יסומנו לא ישתנו.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {fields.map((f) => (
            <div key={f.key} className={`p-3 rounded-xl border transition-all ${enabled[f.key] ? "border-primary/40 bg-primary/[0.03]" : "border-border/50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox checked={!!enabled[f.key]} onCheckedChange={() => toggle(f.key)} id={`bulk-${f.key}`} />
                <Label htmlFor={`bulk-${f.key}`} className="font-semibold cursor-pointer flex-1">{f.label}</Label>
              </div>
              {enabled[f.key] && (
                <>
                  {f.type === "select" ? (
                    <Select value={values[f.key] ?? ""} onValueChange={(v) => setVal(f.key, v)}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר ערך" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {f.options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setVal(f.key, e.target.value)}
                      className="rounded-xl"
                      dir={f.type === "number" ? "ltr" : undefined}
                    />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
            <Button type="submit" disabled={activeCount === 0 || saving} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
              <Save className="h-4 w-4" />
              עדכן {activeCount > 0 && `${activeCount} שדות`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
