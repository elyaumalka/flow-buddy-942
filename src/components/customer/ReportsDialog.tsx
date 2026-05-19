import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Lock, BarChart3, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

type ReportType = "cashflow" | "income_expenses";
type Period = "monthly" | "quarterly" | "yearly" | "range";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FONT_URL = "https://cdn.jsdelivr.net/gh/google/fonts/ofl/heebo/static/Heebo-Regular.ttf";
let cachedFont: string | null = null;

async function loadHebrewFont(): Promise<string | null> {
  if (cachedFont) return cachedFont;
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    cachedFont = btoa(binary);
    return cachedFont;
  } catch {
    return null;
  }
}

const reverseHebrew = (s: string) => {
  if (!s) return s;
  // simple RTL helper for jsPDF
  return s.split("").reverse().join("");
};

export function ReportsDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("cashflow");
  const [period, setPeriod] = useState<Period>("monthly");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getRange = (): { from: Date; to: Date; label: string } => {
    const now = new Date();
    if (period === "monthly") return { from: startOfMonth(now), to: endOfMonth(now), label: format(now, "MM/yyyy") };
    if (period === "quarterly") return { from: startOfQuarter(now), to: endOfQuarter(now), label: `Q${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}` };
    if (period === "yearly") return { from: startOfYear(now), to: endOfYear(now), label: String(now.getFullYear()) };
    return {
      from: rangeStart ? new Date(rangeStart) : startOfMonth(now),
      to: rangeEnd ? new Date(rangeEnd) : endOfMonth(now),
      label: `${rangeStart || "..."} - ${rangeEnd || "..."}`,
    };
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (period === "range" && (!rangeStart || !rangeEnd)) {
      toast({ title: "יש לבחור טווח תאריכים", variant: "destructive" });
      return;
    }
    if (usePassword && !password) {
      toast({ title: "יש להזין סיסמא", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { from, to, label } = getRange();
      const fromIso = from.toISOString();
      const toIso = to.toISOString();

      const [incomeRes, expensesRes] = await Promise.all([
        supabase.from("income").select("*").eq("user_id", user.id).gte("income_date", fromIso).lte("income_date", toIso).order("income_date"),
        supabase.from("expenses").select("*").eq("user_id", user.id).gte("expense_date", fromIso).lte("expense_date", toIso).order("expense_date"),
      ]);

      const incomeRows = incomeRes.data ?? [];
      const expenseRows = expensesRes.data ?? [];

      const fontB64 = await loadHebrewFont();

      const doc = new jsPDF(
        usePassword
          ? { encryption: { userPassword: password, ownerPassword: password, userPermissions: ["print"] } }
          : {}
      );

      if (fontB64) {
        doc.addFileToVFS("Heebo.ttf", fontB64);
        doc.addFont("Heebo.ttf", "Heebo", "normal");
        doc.setFont("Heebo");
      }

      const t = (s: string) => (fontB64 ? reverseHebrew(s) : s);

      const title = reportType === "cashflow" ? "דוח תזרים מזומנים" : "דוח הכנסות והוצאות";
      doc.setFontSize(16);
      doc.text(t(title), 200, 15, { align: "right" });
      doc.setFontSize(10);
      doc.text(t(`תקופה: ${label}`), 200, 23, { align: "right" });
      doc.text(t(`הופק: ${format(new Date(), "dd/MM/yyyy HH:mm")}`), 200, 29, { align: "right" });

      const sumIncome = incomeRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const sumExpense = expenseRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const balance = sumIncome - sumExpense;

      if (reportType === "cashflow") {
        autoTable(doc, {
          startY: 38,
          head: [[t("סכום (₪)"), t("פריט")]],
          body: [
            [sumIncome.toLocaleString(), t("סך הכנסות")],
            [sumExpense.toLocaleString(), t("סך הוצאות")],
            [balance.toLocaleString(), t("תזרים נטו")],
          ],
          styles: { font: fontB64 ? "Heebo" : "helvetica", halign: "right", fontSize: 11 },
          headStyles: { fillColor: [22, 78, 99], halign: "right" },
        });
      } else {
        autoTable(doc, {
          startY: 38,
          head: [[t("סכום"), t("קטגוריה"), t("סוג"), t("תאריך")]],
          body: incomeRows.map((r: any) => [
            Number(r.amount).toLocaleString(),
            t(r.category || "-"),
            t(r.type || "-"),
            format(new Date(r.income_date), "dd/MM/yyyy"),
          ]),
          styles: { font: fontB64 ? "Heebo" : "helvetica", halign: "right", fontSize: 10 },
          headStyles: { fillColor: [22, 163, 74], halign: "right" },
          willDrawCell: () => {},
          didDrawPage: (data) => {
            doc.setFontSize(12);
            doc.text(t("הכנסות"), 200, data.settings.startY! - 4, { align: "right" });
          },
        });
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [[t("סכום"), t("קטגוריה"), t("סוג"), t("תאריך")]],
          body: expenseRows.map((r: any) => [
            Number(r.amount).toLocaleString(),
            t(r.category || "-"),
            t(r.type || "-"),
            format(new Date(r.expense_date), "dd/MM/yyyy"),
          ]),
          styles: { font: fontB64 ? "Heebo" : "helvetica", halign: "right", fontSize: 10 },
          headStyles: { fillColor: [220, 38, 38], halign: "right" },
          didDrawPage: (data) => {
            doc.setFontSize(12);
            doc.text(t("הוצאות"), 200, data.settings.startY! - 4, { align: "right" });
          },
        });
        const finalY = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11);
        doc.text(t(`סך הכנסות: ${sumIncome.toLocaleString()} ₪`), 200, finalY, { align: "right" });
        doc.text(t(`סך הוצאות: ${sumExpense.toLocaleString()} ₪`), 200, finalY + 6, { align: "right" });
        doc.text(t(`יתרה: ${balance.toLocaleString()} ₪`), 200, finalY + 12, { align: "right" });
      }

      const fileName = `${reportType === "cashflow" ? "cashflow" : "income-expenses"}_${label.replace(/[/\\: ]/g, "-")}.pdf`;
      doc.save(fileName);
      toast({ title: "הדוח הופק בהצלחה" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "שגיאה בהפקת הדוח", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border/50 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            הפקת דוחות
          </DialogTitle>
        </DialogHeader>

        {/* Subtle report type selector at top - intentionally muted for advanced users */}
        <div className="flex items-center justify-between gap-2 -mt-1 mb-1 px-2 py-1.5 rounded-lg bg-muted/40 border border-dashed border-border/60">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ArrowLeftRight className="h-3 w-3" />
            סוג דוח
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setReportType("cashflow")}
              className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${reportType === "cashflow" ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              תזרימי
            </button>
            <button
              type="button"
              onClick={() => setReportType("income_expenses")}
              className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${reportType === "income_expenses" ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              הכנסות / הוצאות
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-xs flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> תקופת הדוח
            </Label>
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
              <div className="space-y-2">
                <Label className="font-semibold text-xs">מתאריך</Label>
                <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="rounded-xl" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-xs">עד תאריך</Label>
                <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="rounded-xl" dir="ltr" />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/50 p-3 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> הגן על הקובץ בסיסמא
              </Label>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} />
            </div>
            {usePassword && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזן סיסמא לקובץ ה-PDF"
                className="rounded-xl"
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-border/50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            ביטול
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5"
          >
            <Download className="h-4 w-4" />
            {loading ? "מפיק..." : "הפק דוח"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
