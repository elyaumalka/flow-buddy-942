import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User, Lock, Users, Mail, CreditCard, Tags, Coins, Trash2, Plus, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TITHE_RATES } from "@/lib/financeConstants";
import { CategoryManagerDialog } from "@/components/customer/CategoryManagerDialog";

const MARITAL = ["רווק", "נשוי", "אלמן", "גרוש"];
const EMPLOYMENT = ["שכיר", "עצמאי", "פנסיונר", "אחר"];
const INCOME_RANGE = ["עד 5,000", "5,000-10,000", "10,000-20,000", "מעל 20,000"];
const SECURITY_LEVELS = ["ללא", "סיסמה", "אימות טלפוני"];
const SECURITY_SCOPES = ["כל הקו", "שלוחה 1", "שלוחה 2", "שאר הקו"];
const PERMISSIONS = ["הקלדת נתונים", "שמיעה וקבלת נתונים", "שינוי הגדרות ובעלים"];

interface ProfileUser {
  name: string;
  phone: string;
  email: string;
  permission: string;
}

export default function CustomerSettings() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Personal
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [marital_status, setMarital] = useState("");
  const [employment_type, setEmployment] = useState("");
  const [income_range, setIncomeRange] = useState("");
  const [children_count, setChildren] = useState<string>("");
  const [marriages_count, setMarriages] = useState<string>("");
  const [financial_month_start_day, setMonthStart] = useState<string>("");

  // preferences object
  const [prefs, setPrefs] = useState<Record<string, any>>({});

  const [catOpen, setCatOpen] = useState(false);

  // new user form
  const [newUser, setNewUser] = useState<ProfileUser>({ name: "", phone: "", email: "", permission: PERMISSIONS[0] });
  const [creditInput, setCreditInput] = useState("");

  const setPref = (k: string, v: any) => setPrefs((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setAge(data.age != null ? String(data.age) : "");
        setMarital(data.marital_status ?? "");
        setEmployment(data.employment_type ?? "");
        setIncomeRange(data.income_range ?? "");
        setChildren(data.children_count != null ? String(data.children_count) : "");
        setMarriages(data.marriages_count != null ? String(data.marriages_count) : "");
        setMonthStart(data.financial_month_start_day != null ? String(data.financial_month_start_day) : "");
        setPrefs((data.preferences as Record<string, any>) ?? {});
      }
      setLoading(false);
    })();
  }, []);

  const num = (s: string) => (s === "" ? null : Number(s));

  const updateProfile = async (patch: Record<string, any>) => {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const savePersonal = async () => {
    const ok = await updateProfile({
      full_name, phone, email,
      age: num(age),
      marital_status, employment_type, income_range,
      children_count: num(children_count),
      marriages_count: num(marriages_count),
      financial_month_start_day: num(financial_month_start_day),
      preferences: prefs,
    });
    if (ok) toast({ title: "הפרטים עודכנו בהצלחה" });
  };

  const savePrefs = async (extra?: Record<string, any>) => {
    const next = { ...prefs, ...(extra ?? {}) };
    if (extra) setPrefs(next);
    const ok = await updateProfile({ preferences: next });
    if (ok) toast({ title: "ההגדרות נשמרו" });
    return ok;
  };

  const addUser = async () => {
    if (!newUser.name && !newUser.phone && !newUser.email) {
      toast({ title: "יש למלא לפחות שדה אחד", variant: "destructive" });
      return;
    }
    const users = [...((prefs.users as ProfileUser[]) ?? []), newUser];
    const ok = await savePrefs({ users });
    if (ok) {
      setNewUser({ name: "", phone: "", email: "", permission: PERMISSIONS[0] });
      toast({ title: "המשתמש נוסף" });
    }
  };

  const removeUser = async (idx: number) => {
    const users = ((prefs.users as ProfileUser[]) ?? []).filter((_, i) => i !== idx);
    await savePrefs({ users });
    toast({ title: "המשתמש הוסר" });
  };

  const saveCredit = async () => {
    const last4 = creditInput.replace(/\D/g, "").slice(-4);
    await savePrefs({ credit_card_last4: last4 });
    setCreditInput("");
    toast({ title: "מספר האשראי עודכן" });
  };

  const resetAllData = async () => {
    if (!userId) return;
    for (const t of ["income", "expenses", "goals", "tithes"] as const) {
      await supabase.from(t).delete().eq("user_id", userId);
    }
    toast({ title: "כל הנתונים אופסו" });
  };

  const deleteSelectedData = async () => {
    toast({ title: "הנתונים הנבחרים נמחקו" });
  };

  const users = (prefs.users as ProfileUser[]) ?? [];

  if (loading) {
    return <div className="p-6 text-muted-foreground">טוען...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground">ניהול פרטים אישיים והגדרות חשבון</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1) Personal info */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">פרטים אישיים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={full_name} onChange={(e) => setFullName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>מייל</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input value={prefs.address ?? ""} onChange={(e) => setPref("address", e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>גיל</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>מצב משפחתי</Label>
                <Select value={marital_status} onValueChange={setMarital}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>סוג תעסוקה</Label>
                <Select value={employment_type} onValueChange={setEmployment}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {EMPLOYMENT.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>טווח הכנסה</Label>
                <Select value={income_range} onValueChange={setIncomeRange}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {INCOME_RANGE.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>מספר ילדים</Label>
                <Input type="number" value={children_count} onChange={(e) => setChildren(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>מספר נישואין</Label>
                <Input type="number" value={marriages_count} onChange={(e) => setMarriages(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>תחילת חודש כספי</Label>
                <Input type="number" min={1} max={31} value={financial_month_start_day} onChange={(e) => setMonthStart(e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
            </div>
            <Button onClick={savePersonal} className="rounded-xl gradient-primary border-0">שמור שינויים</Button>
          </CardContent>
        </Card>

        {/* 2) Security */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base">אבטחה וסיסמה</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>רמת אבטחה</Label>
              <Select value={prefs.security_level ?? ""} onValueChange={(v) => setPref("security_level", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SECURITY_LEVELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>היקף אבטחה</Label>
              <Select value={prefs.security_scope ?? ""} onValueChange={(v) => setPref("security_scope", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="בחר" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SECURITY_SCOPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">החלפת סיסמה דורשת אימות טלפוני</p>
            <Button variant="outline" className="rounded-xl" onClick={() => toast({ title: "קוד אימות נשלח" })}>
              שלח קוד אימות
            </Button>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
              <Label className="cursor-pointer">סיסמה לדוחות</Label>
              <Switch checked={!!prefs.report_password_enabled} onCheckedChange={(v) => setPref("report_password_enabled", v)} />
            </div>
            {prefs.report_password_enabled && (
              <div className="space-y-2">
                <Label>סיסמת דוחות</Label>
                <Input type="password" value={prefs.report_password ?? ""} onChange={(e) => setPref("report_password", e.target.value)} dir="ltr" className="rounded-xl" />
              </div>
            )}
            <Button onClick={() => savePrefs()} className="rounded-xl gradient-primary border-0">שמור הגדרות אבטחה</Button>
          </CardContent>
        </Card>

        {/* 3) Users & permissions */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">משתמשים והרשאות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.length > 0 && (
              <div className="space-y-2">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                    <div className="text-sm">
                      <p className="font-semibold">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.phone} {u.email}</p>
                      <p className="text-xs text-primary">{u.permission}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => removeUser(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3 p-3 rounded-xl border border-dashed border-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>שם</Label>
                  <Input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>טלפון</Label>
                  <Input value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} dir="ltr" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>מייל</Label>
                <Input value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} dir="ltr" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>הרשאה</Label>
                <Select value={newUser.permission} onValueChange={(v) => setNewUser((p) => ({ ...p, permission: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PERMISSIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={addUser}>
                <Plus className="h-4 w-4 ml-2" /> הוסף משתמש
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4) Mailing preferences */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">העדפות דיוור</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { k: "marketing_emails", label: "דיוור שיווקי" },
              { k: "system_updates", label: "עדכוני מערכת" },
              { k: "monthly_report_email", label: "דוח חודשי במייל" },
              { k: "monthly_report_password", label: "סיסמה לדוח החודשי" },
              { k: "deviation_alerts", label: "התראה על חריגה" },
              { k: "achievement_alerts", label: "התראות על הישגים והטבות" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                <Label className="cursor-pointer">{row.label}</Label>
                <Switch checked={!!prefs[row.k]} onCheckedChange={(v) => setPref(row.k, v)} />
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/50">
              <Label className="cursor-pointer">התראה על העדר נתונים</Label>
              <Switch checked={!!prefs.no_data_alert} onCheckedChange={(v) => setPref("no_data_alert", v)} />
            </div>
            {prefs.no_data_alert && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>כל כמה ימים</Label>
                  <Input type="number" value={prefs.no_data_every_days ?? ""} onChange={(e) => setPref("no_data_every_days", e.target.value === "" ? null : Number(e.target.value))} dir="ltr" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>שעות</Label>
                  <Input value={prefs.no_data_hours ?? ""} onChange={(e) => setPref("no_data_hours", e.target.value)} className="rounded-xl" />
                </div>
              </div>
            )}
            <Button onClick={() => savePrefs()} className="rounded-xl gradient-primary border-0">שמור העדפות</Button>
          </CardContent>
        </Card>

        {/* 5) Payment methods */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">אמצעי תשלום</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {prefs.credit_card_last4 && (
              <p className="text-sm text-muted-foreground">כרטיס נוכחי: •••• {prefs.credit_card_last4}</p>
            )}
            <div className="space-y-2">
              <Label>עדכון מספר אשראי</Label>
              <Input value={creditInput} onChange={(e) => setCreditInput(e.target.value)} dir="ltr" className="rounded-xl" placeholder="מספר כרטיס" />
            </div>
            <Button onClick={saveCredit} className="rounded-xl gradient-primary border-0">עדכן אשראי</Button>
          </CardContent>
        </Card>

        {/* 6) Categories */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Tags className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">קטגוריות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">ניהול קטגוריות הכנסה והוצאה.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => setCatOpen(true)}>
              <Tags className="h-4 w-4 ml-2" /> ניהול קטגוריות
            </Button>
          </CardContent>
        </Card>

        {/* 7) Tithe */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">מעשרות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>שיעור מעשר</Label>
              <Select
                value={String(prefs.tithe_rate ?? 10)}
                onValueChange={(v) => setPref("tithe_rate", Number(v))}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TITHE_RATES.map((r) => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => savePrefs()} className="rounded-xl gradient-primary border-0">שמור</Button>
          </CardContent>
        </Card>

        {/* 8) Danger zone */}
        <Card className="animate-fade-in border-destructive/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base text-destructive">מחיקות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-xl w-full border-destructive/40 text-destructive hover:bg-destructive/10">
                  מחיקת נתונים נבחרים
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl" className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>מחיקת נתונים נבחרים</AlertDialogTitle>
                  <AlertDialogDescription>פעולה זו אינה הפיכה ולא מומלצת.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={deleteSelectedData}>
                    מחק
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl w-full">
                  איפוס כל הנתונים
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl" className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>איפוס כל הנתונים</AlertDialogTitle>
                  <AlertDialogDescription>פעולה זו אינה הפיכה ולא מומלצת.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={resetAllData}>
                    אפס הכל
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <CategoryManagerDialog open={catOpen} onOpenChange={setCatOpen} />
    </div>
  );
}
