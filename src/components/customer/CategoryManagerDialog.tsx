import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/admin/DataTable";
import { useCategories, type Category } from "@/hooks/useCategories";
import { CATEGORY_KINDS, CATEGORY_TYPES, CATEGORY_PERIODS } from "@/lib/financeConstants";
import { useToast } from "@/hooks/use-toast";
import { Save, Archive, ArchiveRestore } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  id?: string;
  name: string;
  kind: string;
  category_type: string;
  period: string | null;
  extension: string;
  tithe_liable: boolean;
  tithe_offset: boolean;
  archived: boolean;
}

const emptyForm: FormState = {
  name: "",
  kind: "income",
  category_type: "קבוע",
  period: null,
  extension: "",
  tithe_liable: true,
  tithe_offset: false,
  archived: false,
};

const kindLabel = (k: string) => CATEGORY_KINDS.find((x) => x.value === k)?.label ?? k;

export function CategoryManagerDialog({ open, onOpenChange }: Props) {
  const { all, createCategory, updateCategory, removeCategory, bulkRemoveCategories } = useCategories();
  const { toast } = useToast();

  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormOpen(false);
      setShowArchived(false);
    }
  }, [open]);

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const visible = all.filter((c) => (showArchived ? true : !c.archived));

  const openAdd = () => {
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      kind: c.kind,
      category_type: c.category_type,
      period: c.period,
      extension: c.extension ?? "",
      tithe_liable: c.tithe_liable,
      tithe_offset: c.tithe_offset,
      archived: c.archived,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "יש להזין שם קטגוריה", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        category_type: form.category_type,
        period: form.category_type === "משתנה" ? form.period : null,
        extension: form.extension || null,
        tithe_liable: form.tithe_liable,
        tithe_offset: form.tithe_offset,
        archived: form.archived,
      };
      if (form.id) {
        await updateCategory({ id: form.id, ...payload } as any);
        toast({ title: "הקטגוריה עודכנה" });
      } else {
        await createCategory(payload as any);
        toast({ title: "הקטגוריה נוספה" });
      }
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (c: Category) => {
    await updateCategory({ id: c.id, archived: !c.archived } as any);
    toast({ title: c.archived ? "הקטגוריה שוחזרה" : "הקטגוריה הועברה לארכיון" });
  };

  const columns = [
    { key: "name", header: "שם" },
    { key: "kind", header: "סוג", render: (c: Category) => kindLabel(c.kind) },
    { key: "category_type", header: "קבוע/משתנה" },
    { key: "period", header: "תקופה", render: (c: Category) => c.period ?? "-" },
    { key: "extension", header: "שלוחה", render: (c: Category) => c.extension || "-" },
    {
      key: "tithe_liable",
      header: "חייב מעשר",
      render: (c: Category) => (c.tithe_liable ? "כן" : "לא"),
    },
    {
      key: "tithe_offset",
      header: "מקזז מעשר",
      render: (c: Category) => (c.tithe_offset ? "כן" : "לא"),
    },
    {
      key: "archived",
      header: "ארכיון",
      render: (c: Category) => (c.archived ? "מאורכב" : "פעיל"),
    },
  ];

  const filters = [
    { key: "kind", label: "סוג", options: CATEGORY_KINDS.map((k) => k.value) },
    { key: "category_type", label: "קבוע/משתנה", options: [...CATEGORY_TYPES] },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-2xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">ניהול קטגוריות</DialogTitle>
          <DialogDescription>הוספה, עריכה, ארכוב ומחיקה של קטגוריות הכנסה והוצאה.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 py-2">
          <Label htmlFor="show-archived" className="text-sm">הצג ארכיון</Label>
          <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
        </div>

        <DataTable<Category>
          data={visible}
          columns={columns}
          title="קטגוריות"
          onAdd={openAdd}
          addLabel="קטגוריה חדשה"
          onRowClick={(c) => openEdit(c)}
          onBulkDelete={async (ids) => {
            await bulkRemoveCategories(ids);
            toast({ title: "הקטגוריות נמחקו" });
          }}
          filters={filters}
          extraRowActions={[
            {
              label: "ארכוב / שחזור",
              icon: Archive,
              onClick: (c: Category) => toggleArchive(c),
            },
          ]}
        />

        {/* Add / Edit form dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold">
                {form.id ? "עריכת קטגוריה" : "קטגוריה חדשה"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>שם</Label>
                <Input value={form.name} onChange={(e) => setF("name", e.target.value)} className="rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>סוג</Label>
                  <Select
                    value={form.kind}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        kind: v,
                        tithe_liable: v === "income" ? true : p.tithe_liable,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORY_KINDS.map((k) => (
                        <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>קבוע/משתנה</Label>
                  <Select
                    value={form.category_type}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        category_type: v,
                        period: v === "משתנה" ? (p.period ?? "חודשי") : null,
                      }))
                    }
                  >
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.category_type === "משתנה" && (
                <div className="space-y-2">
                  <Label>תקופה</Label>
                  <Select value={form.period ?? ""} onValueChange={(v) => setF("period", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר תקופה" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORY_PERIODS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>שלוחה</Label>
                <Input value={form.extension} onChange={(e) => setF("extension", e.target.value)} className="rounded-xl" dir="ltr" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                <Label htmlFor="tithe_liable" className="cursor-pointer">חייב במעשר</Label>
                <Switch id="tithe_liable" checked={form.tithe_liable} onCheckedChange={(v) => setF("tithe_liable", v)} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                <Label htmlFor="tithe_offset" className="cursor-pointer">מקזז מעשר (לדוגמה: צדקה)</Label>
                <Switch id="tithe_offset" checked={form.tithe_offset} onCheckedChange={(v) => setF("tithe_offset", v)} />
              </div>

              {form.id && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                  <Label htmlFor="archived" className="cursor-pointer flex items-center gap-2">
                    {form.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    מאורכב
                  </Label>
                  <Switch id="archived" checked={form.archived} onCheckedChange={(v) => setF("archived", v)} />
                </div>
              )}

              <div className="flex gap-2 justify-between pt-3 border-t border-border/50">
                {form.id ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={async () => {
                      await removeCategory(form.id!);
                      toast({ title: "הקטגוריה נמחקה" });
                      setFormOpen(false);
                    }}
                  >
                    מחק
                  </Button>
                ) : <span />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)} className="rounded-xl">ביטול</Button>
                  <Button type="submit" disabled={saving} className="rounded-xl gradient-primary border-0 shadow-glow-sm gap-1.5">
                    <Save className="h-4 w-4" /> שמור
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
