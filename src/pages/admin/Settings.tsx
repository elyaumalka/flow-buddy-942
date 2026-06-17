import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Printer, Bell, Lock, Save, Plus, X, ShieldCheck, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SettingsData {
  price: number;
  fax_limit: number;
  payment_popup_enabled: boolean;
  access_minutes: number;
  access_categories: string[];
  [key: string]: any;
}

const DEFAULTS: SettingsData = {
  price: 0,
  fax_limit: 0,
  payment_popup_enabled: false,
  access_minutes: 15,
  access_categories: [],
};

const ACCESS_MINUTE_OPTIONS = [5, 10, 15, 30, 60, 120];

export default function AdminSettings() {
  const { toast } = useToast();
  const [data, setData] = useState<SettingsData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabase.from("system_settings").select("data").eq("id", 1).single();
      if (!error && row?.data) {
        setData({ ...DEFAULTS, ...(row.data as Partial<SettingsData>) });
      }
      setLoading(false);
    })();
  }, []);

  const set = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) => setData((p) => ({ ...p, [k]: v }));

  const save = async (merged?: Partial<SettingsData>) => {
    setSaving(true);
    const payload = { ...data, ...(merged || {}) };
    const { error } = await supabase.from("system_settings").update({ data: payload }).eq("id", 1);
    setSaving(false);
    if (error) {
      toast({ title: "שגיאה בשמירה", description: error.message, variant: "destructive" });
      return;
    }
    if (merged) setData(payload);
    toast({ title: "ההגדרות נשמרו" });
  };

  const addCategory = () => {
    const v = newCategory.trim();
    if (!v || data.access_categories.includes(v)) return;
    set("access_categories", [...data.access_categories, v]);
    setNewCategory("");
  };
  const removeCategory = (c: string) =>
    set("access_categories", data.access_categories.filter((x) => x !== c));

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground">טוען הגדרות...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
          <p className="text-muted-foreground">הגדרות מערכת וחיבורים</p>
        </div>
        <Button onClick={() => save()} disabled={saving} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
          <Save className="h-4 w-4" /> שמירה כללית
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">מחיר</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>מחיר (₪)</Label>
              <Input type="number" dir="ltr" className="rounded-xl" value={data.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
            </div>
            <Button variant="outline" className="rounded-xl" disabled={saving} onClick={() => save({ price: data.price })}>
              <Save className="h-4 w-4 ml-2" /> שמירה
            </Button>
          </CardContent>
        </Card>

        {/* Fax limit */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Printer className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">הגבלת פקסים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>תקרת פקסים</Label>
              <Input type="number" dir="ltr" className="rounded-xl" value={data.fax_limit ?? 0} onChange={(e) => set("fax_limit", Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">אם הגיע לתקרה המערכת תתריע</p>
            </div>
            <Button variant="outline" className="rounded-xl" disabled={saving} onClick={() => save({ fax_limit: data.fax_limit })}>
              <Save className="h-4 w-4 ml-2" /> שמירה
            </Button>
          </CardContent>
        </Card>

        {/* Payment popup */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-chart-4" />
              </div>
              <CardTitle className="text-base">חלונות קופצים לתשלום</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>הצגת חלון קופץ בעת בעיית תשלום</Label>
              <Switch checked={!!data.payment_popup_enabled} onCheckedChange={(v) => set("payment_popup_enabled", v)} />
            </div>
            <p className="text-xs text-muted-foreground">חלון קופץ יוצג ללקוח כאשר קיימת בעיית תשלום.</p>
            <Button variant="outline" className="rounded-xl" disabled={saving} onClick={() => save({ payment_popup_enabled: data.payment_popup_enabled })}>
              <Save className="h-4 w-4 ml-2" /> שמירה
            </Button>
          </CardContent>
        </Card>

        {/* Personal data access */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base">גישה לנתונים אישיים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>משך גישה (דקות)</Label>
              <Select value={String(data.access_minutes ?? 15)} onValueChange={(v) => set("access_minutes", Number(v))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ACCESS_MINUTE_OPTIONS.map((m) => <SelectItem key={m} value={String(m)}>{m} דקות</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">אישור הלקוח לגישה מתבצע באמצעות אימות טלפוני.</p>
            </div>
            <div className="space-y-2">
              <Label>קטגוריות גישה</Label>
              <div className="flex gap-2">
                <Input
                  className="rounded-xl"
                  placeholder="הוסף קטגוריה..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
                />
                <Button type="button" variant="outline" className="rounded-xl shrink-0" onClick={addCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {data.access_categories.length === 0 && <span className="text-xs text-muted-foreground">לא הוגדרו קטגוריות</span>}
                {data.access_categories.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full gap-1 pr-2 pl-1 py-1">
                    {c}
                    <button type="button" onClick={() => removeCategory(c)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="outline" className="rounded-xl" disabled={saving} onClick={() => save({ access_minutes: data.access_minutes, access_categories: data.access_categories })}>
              <Save className="h-4 w-4 ml-2" /> שמירה
            </Button>
          </CardContent>
        </Card>

        {/* Coupons note */}
        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-chart-2" />
              </div>
              <CardTitle className="text-base">קודי קופון</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">קודי קופון נבחרים מתוך רשימה נפתחת במסך הרלוונטי.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
