import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Lock, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

type ReportType = "general" | "tithe" | "income" | "expense" | "categories" | "analysis";
type Period = "monthly" | "quarterly" | "yearly" | "range";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const FONT_URL = "https://cdn.jsdelivr.net/gh/google/fonts/ofl/heebo/static/Heebo-Regular.ttf";
let cachedFont: string | null = null;
async function loadHebrewFont(): Promise<string | null> {
  if (cachedFont) return cachedFont;
  try {
    const res = await fetch(FONT_URL); if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    let binary = ""; const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    cachedFont = btoa(binary); return cachedFont;
  } catch { return null; }
}
const reverseHebrew = (s: string) => (s ? s.split("").reverse().join("") : s);

export function ReportsDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("general");
  const [period, setPeriod] = useState<Period>("monthly");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [allCategories, setAllCategories] = useState<{ income: string[]; expense: string[] }>({ income: [], expense: [] });
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [i, e] = await Promise.all([
        supabase.from("income").select("category").eq("user_id", user.id),
        supabase.from("expenses").select("category").eq("user_id", user.id),
      ]);
      const incomeCats = Array.from(new Set((i.data || []).map((r: any) => r.category).filter(Boolean))) as string[];
      const expenseCats = Array.from(new Set((e.data || []).map((r: any) => r.category).filter(Boolean))) as string[];
      setAllCategories({ income: incomeCats, expense: expenseCats });
    })();
  }, [open, user]);

  const getRange = (): { from: Date; to: Date; label: string } => {
    const now = new Date();
    if (period === "monthly") return { from: startOfMonth(now), to: endOfMonth(now), label: format(now, "MM/yyyy") };
    if (period === "quarterly") return { from: startOfQuarter(now), to: endOfQuarter(now), label: `Q${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}` };
    if (period === "yearly") return { from: startOfYear(now), to: endOfYear(now), label: String(now.getFullYear()) };
    return { from: rangeStart ? new Date(rangeStart) : startOfMonth(now), to: rangeEnd ? new Date(rangeEnd) : endOfMonth(now), label: `${rangeStart || "..."} - ${rangeEnd || "..."}` };
  };

  const toggleCat = (c: string) => setSelectedCats((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const handleGenerate = async () => {
    if (!user) return;
    if (period === "range" && (!rangeStart || !rangeEnd)) { toast({ title: "יש לבחור טווח תאריכים", variant: "destructive" }); return; }
    if (usePassword && !password) { toast({ title: "יש להזין סיסמא", variant: "destructive" }); return; }
    if (reportType === "categories" && selectedCats.length === 0) { toast({ title: "יש לבחור לפחות קטגוריה אחת", variant: "destructive" }); return; }

    setLoading(true);
    try {
      const { from, to, label } = getRange();
      const fromIso = from.toISOString(); const toIso = to.toISOString();
      const [incomeRes, expensesRes, tithesRes] = await Promise.all([
        supabase.from("income").select("*").eq("user_id", user.id).gte("income_date", fromIso).lte("income_date", toIso).order("income_date"),
        supabase.from("expenses").select("*").eq("user_id", user.id).gte("expense_date", fromIso).lte("expense_date", toIso).order("expense_date"),
        supabase.from("tithes").select("*").eq("user_id", user.id).gte("tithe_date", fromIso).lte("tithe_date", toIso).order("tithe_date"),
      ]);
      const incomeRows = incomeRes.data ?? [];
      const expenseRows = expensesRes.data ?? [];
      const titheRows = tithesRes.data ?? [];

      const fontB64 = await loadHebrewFont();
      const doc = new jsPDF(usePassword ? { encryption: { userPassword: password, ownerPassword: password, userPermissions: ["print"] } } : {});
      if (fontB64) { doc.addFileToVFS("Heebo.ttf", fontB64); doc.addFont("Heebo.ttf", "Heebo", "normal"); doc.setFont("Heebo"); }
      const t = (s: string) => (fontB64 ? reverseHebrew(s) : s);
      const baseFont = fontB64 ? "Heebo" : "helvetica";
      const fmtNum = (n: number) => Number(n || 0).toLocaleString();

      const titleMap: Record<ReportType, string> = {
        general: "דוח כללי", tithe: "דוח מעשרות", income: "דוח הכנסות",
        expense: "דוח הוצאות", categories: "דוח קטגוריות", analysis: "דוח ניתוח",
      };
      doc.setFontSize(16); doc.text(t(titleMap[reportType]), 200, 15, { align: "right" });
      doc.setFontSize(10);
      doc.text(t(`תקופה: ${label}`), 200, 23, { align: "right" });
      doc.text(t(`הופק: ${format(new Date(), "dd/MM/yyyy HH:mm")}`), 200, 29, { align: "right" });

      const sumIncome = incomeRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const sumExpense = expenseRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const sumTithe = titheRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const balance = sumIncome - sumExpense;

      const groupBy = (rows: any[], key: string) => {
        const m: Record<string, number> = {};
        rows.forEach((r: any) => { const k = r[key] || "ללא קטגוריה"; m[k] = (m[k] || 0) + Number(r.amount || 0); });
        return m;
      };

      // helper: draw simple horizontal bar comparison
      const drawCompareBar = (y: number, title: string, parts: { label: string; value: number; color: [number, number, number] }[]) => {
        doc.setFontSize(11); doc.text(t(title), 200, y, { align: "right" });
        const max = Math.max(1, ...parts.map(p => p.value));
        let yy = y + 4;
        parts.forEach((p) => {
          const w = (p.value / max) * 140;
          doc.setFillColor(...p.color); doc.rect(60, yy, w, 6, "F");
          doc.setFontSize(9);
          doc.text(t(`${p.label}: ${fmtNum(p.value)} ₪`), 200, yy + 4.5, { align: "right" });
          yy += 10;
        });
        return yy;
      };

      const detailHead = (kind: "income" | "expense") => [[t("סכום"), t("קטגוריה"), t("סוג"), t("תאריך")]];
      const detailBody = (rows: any[], dateField: string) => rows.map((r: any) => [
        fmtNum(Number(r.amount)), t(r.category || "-"), t(r.type || "-"), format(new Date(r[dateField]), "dd/MM/yyyy"),
      ]);

      let cursorY = 38;

      if (reportType === "general") {
        // summary block
        autoTable(doc, {
          startY: cursorY,
          head: [[t("סכום (₪)"), t("פריט")]],
          body: [
            [fmtNum(sumIncome), t("סך הכנסות")],
            [fmtNum(sumExpense), t("סך הוצאות")],
            [fmtNum(balance), t("יתרה / תזרים")],
            [fmtNum(sumTithe), t("מעשרות שולמו")],
          ],
          styles: { font: baseFont, halign: "right", fontSize: 11 },
          headStyles: { fillColor: [22, 78, 99], halign: "right" },
        });
        cursorY = (doc as any).lastAutoTable.finalY + 8;
        cursorY = drawCompareBar(cursorY, "השוואה ויזואלית", [
          { label: "הכנסות", value: sumIncome, color: [34, 197, 94] },
          { label: "הוצאות", value: sumExpense, color: [239, 68, 68] },
          { label: "מעשרות", value: sumTithe, color: [99, 102, 241] },
        ]);
        // category breakdown bars
        const incByCat = groupBy(incomeRows, "category");
        const expByCat = groupBy(expenseRows, "category");
        const incEntries = Object.entries(incByCat).sort((a, b) => b[1] - a[1]);
        const expEntries = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
        if (incEntries.length) cursorY = drawCompareBar(cursorY + 4, "הכנסות לפי קטגוריה", incEntries.map(([k, v]) => ({ label: k, value: v, color: [34, 197, 94] })));
        if (expEntries.length) cursorY = drawCompareBar(cursorY + 4, "הוצאות לפי קטגוריה", expEntries.map(([k, v]) => ({ label: k, value: v, color: [239, 68, 68] })));

        // details
        doc.addPage();
        autoTable(doc, { startY: 20, head: detailHead("income"), body: detailBody(incomeRows, "income_date"),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [22, 163, 74], halign: "right" },
          didDrawPage: (d) => { doc.setFontSize(12); doc.text(t("פירוט הכנסות"), 200, d.settings.startY! - 4, { align: "right" }); } });
        autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10, head: detailHead("expense"), body: detailBody(expenseRows, "expense_date"),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [220, 38, 38], halign: "right" },
          didDrawPage: (d) => { doc.setFontSize(12); doc.text(t("פירוט הוצאות"), 200, d.settings.startY! - 4, { align: "right" }); } });
        if (titheRows.length) {
          autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10,
            head: [[t("סכום"), t("למי ניתן"), t("הערות"), t("תאריך")]],
            body: titheRows.map((r: any) => [fmtNum(r.amount), t(r.recipient || "-"), t(r.notes || "-"), format(new Date(r.tithe_date), "dd/MM/yyyy")]),
            styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [99, 102, 241], halign: "right" },
            didDrawPage: (d) => { doc.setFontSize(12); doc.text(t("פירוט מעשרות"), 200, d.settings.startY! - 4, { align: "right" }); } });
        }
      } else if (reportType === "tithe") {
        autoTable(doc, { startY: cursorY,
          head: [[t("סכום (₪)"), t("פריט")]],
          body: [[fmtNum(sumIncome), t("סך הכנסות")], [fmtNum(Math.round(sumIncome * 0.1)), t("מעשר צפוי (10%)")], [fmtNum(sumTithe), t("מעשר שולם")], [fmtNum(Math.max(Math.round(sumIncome * 0.1) - sumTithe, 0)), t("נותר לתשלום")]],
          styles: { font: baseFont, halign: "right", fontSize: 11 }, headStyles: { fillColor: [99, 102, 241], halign: "right" } });
        autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10,
          head: [[t("סכום"), t("למי ניתן"), t("הערות"), t("תאריך")]],
          body: titheRows.map((r: any) => [fmtNum(r.amount), t(r.recipient || "-"), t(r.notes || "-"), format(new Date(r.tithe_date), "dd/MM/yyyy")]),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [99, 102, 241], halign: "right" } });
      } else if (reportType === "income") {
        autoTable(doc, { startY: cursorY, head: detailHead("income"), body: detailBody(incomeRows, "income_date"),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [22, 163, 74], halign: "right" } });
        const finalY = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11); doc.text(t(`סך הכנסות: ${fmtNum(sumIncome)} ₪`), 200, finalY, { align: "right" });
      } else if (reportType === "expense") {
        autoTable(doc, { startY: cursorY, head: detailHead("expense"), body: detailBody(expenseRows, "expense_date"),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [220, 38, 38], halign: "right" } });
        const finalY = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11); doc.text(t(`סך הוצאות: ${fmtNum(sumExpense)} ₪`), 200, finalY, { align: "right" });
      } else if (reportType === "categories") {
        const filteredInc = incomeRows.filter((r: any) => selectedCats.includes(r.category));
        const filteredExp = expenseRows.filter((r: any) => selectedCats.includes(r.category));
        const incByCat = groupBy(filteredInc, "category");
        const expByCat = groupBy(filteredExp, "category");
        const summary: any[] = [];
        selectedCats.forEach((c) => { summary.push([fmtNum((incByCat[c] || 0) - (expByCat[c] || 0)), fmtNum(expByCat[c] || 0), fmtNum(incByCat[c] || 0), t(c)]); });
        const totalIn = Object.values(incByCat).reduce((a, b) => a + b, 0);
        const totalEx = Object.values(expByCat).reduce((a, b) => a + b, 0);
        summary.push([fmtNum(totalIn - totalEx), fmtNum(totalEx), fmtNum(totalIn), t("סה״כ")]);
        autoTable(doc, { startY: cursorY,
          head: [[t("נטו"), t("הוצאות"), t("הכנסות"), t("קטגוריה")]],
          body: summary, styles: { font: baseFont, halign: "right", fontSize: 11 },
          headStyles: { fillColor: [22, 78, 99], halign: "right" } });
        // details per category
        let y = (doc as any).lastAutoTable.finalY + 10;
        selectedCats.forEach((c) => {
          const rows = [
            ...filteredInc.filter((r: any) => r.category === c).map((r: any) => [fmtNum(r.amount), t("הכנסה"), t(r.type || "-"), format(new Date(r.income_date), "dd/MM/yyyy")]),
            ...filteredExp.filter((r: any) => r.category === c).map((r: any) => [fmtNum(r.amount), t("הוצאה"), t(r.type || "-"), format(new Date(r.expense_date), "dd/MM/yyyy")]),
          ];
          if (!rows.length) return;
          autoTable(doc, { startY: y, head: [[t("סכום"), t("סוג פעולה"), t("סוג"), t("תאריך")]], body: rows,
            styles: { font: baseFont, halign: "right", fontSize: 9 }, headStyles: { fillColor: [71, 85, 105], halign: "right" },
            didDrawPage: (d) => { doc.setFontSize(11); doc.text(t(c), 200, d.settings.startY! - 4, { align: "right" }); } });
          y = (doc as any).lastAutoTable.finalY + 8;
        });
      } else if (reportType === "analysis") {
        const incByCat = groupBy(incomeRows, "category");
        const expByCat = groupBy(expenseRows, "category");
        const allCats = Array.from(new Set([...Object.keys(incByCat), ...Object.keys(expByCat)]));
        let y = cursorY;
        const renderSection = (cat: string, kind: "income" | "expense") => {
          const sum = kind === "income" ? (incByCat[cat] || 0) : (expByCat[cat] || 0);
          const rows = (kind === "income" ? incomeRows : expenseRows).filter((r: any) => (r.category || "ללא קטגוריה") === cat);
          if (!rows.length) return;
          // big summary header
          autoTable(doc, { startY: y,
            head: [[t("יעד"), t("מקום לשיפור"), t("סה״כ ₪"), t(`${kind === "income" ? "הכנסות" : "הוצאות"} — ${cat}`)]],
            body: [["", "", fmtNum(sum), ""]],
            styles: { font: baseFont, halign: "right", fontSize: 12, minCellHeight: 14 },
            headStyles: { fillColor: kind === "income" ? [22, 163, 74] : [220, 38, 38], halign: "right", fontSize: 12 },
            columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 38 } },
          });
          y = (doc as any).lastAutoTable.finalY + 2;
          // detail
          autoTable(doc, { startY: y,
            head: [[t("סכום"), t("סוג"), t("תאריך")]],
            body: rows.map((r: any) => [fmtNum(r.amount), t(r.type || "-"), format(new Date(r[kind === "income" ? "income_date" : "expense_date"]), "dd/MM/yyyy")]),
            styles: { font: baseFont, halign: "right", fontSize: 9 }, headStyles: { fillColor: [148, 163, 184], halign: "right" } });
          y = (doc as any).lastAutoTable.finalY + 8;
        };
        // incomes first
        Object.keys(incByCat).forEach((c) => renderSection(c, "income"));
        Object.keys(expByCat).forEach((c) => renderSection(c, "expense"));
      }

      const fileName = `${reportType}_${label.replace(/[/\\: ]/g, "-")}.pdf`;
      doc.save(fileName);
      toast({ title: "הדוח הופק בהצלחה" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "שגיאה בהפקת הדוח", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const allCats = Array.from(new Set([...allCategories.income, ...allCategories.expense]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            הפקת דוחות
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-xs">סוג הדוח</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="general">כללי — סיכום + תרשימים + פירוט</SelectItem>
                <SelectItem value="tithe">מעשרות</SelectItem>
                <SelectItem value="income">הכנסות</SelectItem>
                <SelectItem value="expense">הוצאות</SelectItem>
                <SelectItem value="categories">קטגוריות נבחרות + סיכום</SelectItem>
                <SelectItem value="analysis">ניתוח — פירוט לפי קטגוריה (כולל מקום לשיפור / יעד)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === "categories" && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Label className="font-semibold text-xs">בחר קטגוריות</Label>
              {allCats.length === 0 ? (
                <p className="text-xs text-muted-foreground">אין קטגוריות להצגה</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allCats.map((c) => {
                    const checked = selectedCats.includes(c);
                    return (
                      <label key={c} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-xs ${checked ? "bg-primary/10 border-primary" : "border-border bg-background"}`}>
                        <Checkbox checked={checked} onCheckedChange={() => toggleCat(c)} />
                        {c}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-semibold text-xs flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> תקופת הדוח</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="monthly">חודשי (חודש נוכחי)</SelectItem>
                <SelectItem value="quarterly">רבעוני (רבעון נוכחי)</SelectItem>
                <SelectItem value="yearly">שנתי (שנה נוכחית)</SelectItem>
                <SelectItem value="range">בחירת טווח מותאם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="font-semibold text-xs">מתאריך</Label><Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="rounded-xl" dir="ltr" /></div>
              <div className="space-y-2"><Label className="font-semibold text-xs">עד תאריך</Label><Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="rounded-xl" dir="ltr" /></div>
            </div>
          )}

          <div className="rounded-xl border border-border/50 p-3 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> הגן על הקובץ בסיסמא</Label>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} />
            </div>
            {usePassword && <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="הזן סיסמא לקובץ ה-PDF" className="rounded-xl" />}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
          <Button onClick={handleGenerate} disabled={loading} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
            <Download className="h-4 w-4" />{loading ? "מפיק..." : "הפק דוח"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
