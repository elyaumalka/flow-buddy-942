import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Lock, BarChart3, Mail, FileSpreadsheet, FileType } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { gregWithHebrew } from "@/lib/hebrewDate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

type ReportType = "general" | "tithe" | "income" | "expense" | "categories" | "analysis";
type Period = "monthly" | "quarterly" | "yearly" | "range";
type FileFormat = "pdf" | "xlsx";

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
  const [fileFormat, setFileFormat] = useState<FileFormat>("pdf");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<null | "download" | "email">(null);

  const [allCategories, setAllCategories] = useState<{ income: string[]; expense: string[] }>({ income: [], expense: [] });
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [filterPaymentMethods, setFilterPaymentMethods] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterKind, setFilterKind] = useState<"all" | "income" | "expense">("all");
  const [pendingCounts, setPendingCounts] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    if (!open || !user) return;
    if (!rangeStart) setRangeStart(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    if (!rangeEnd) setRangeEnd(format(endOfMonth(new Date()), "yyyy-MM-dd"));
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

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { from, to } = getRange();
      const fromIso = from.toISOString();
      const toIso = to.toISOString();
      const [inc, exp] = await Promise.all([
        supabase.from("income").select("status").eq("user_id", user.id).gte("income_date", fromIso).lte("income_date", toIso),
        supabase.from("expenses").select("status").eq("user_id", user.id).gte("expense_date", fromIso).lte("expense_date", toIso),
      ]);
      const incPending = (inc.data || []).filter((r: any) => r.status !== "מאושר").length;
      const expPending = (exp.data || []).filter((r: any) => r.status !== "מאושר").length;
      setPendingCounts({ income: incPending, expense: expPending });
    })();
  }, [open, user, period, rangeStart, rangeEnd]);

  const getRange = (): { from: Date; to: Date; label: string } => {
    const now = new Date();
    if (period === "monthly") return { from: startOfMonth(now), to: endOfMonth(now), label: format(now, "MM/yyyy") };
    if (period === "quarterly") return { from: startOfQuarter(now), to: endOfQuarter(now), label: `Q${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}` };
    if (period === "yearly") return { from: startOfYear(now), to: endOfYear(now), label: String(now.getFullYear()) };
    return { from: rangeStart ? new Date(rangeStart) : startOfMonth(now), to: rangeEnd ? new Date(rangeEnd) : endOfMonth(now), label: `${rangeStart || "..."} - ${rangeEnd || "..."}` };
  };

  const toggleCat = (c: string) => setSelectedCats((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const buildXlsx = async (incomeRows: any[], expenseRows: any[], titheRows: any[], label: string): Promise<Blob> => {
    const wb = XLSX.utils.book_new();
    const fmt = (n: number) => Number(n || 0);
    const sumIncome = incomeRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const sumExpense = expenseRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const sumTithe = titheRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const groupBy = (rows: any[], key: string) => {
      const m: Record<string, number> = {};
      rows.forEach((r: any) => { const k = r[key] || "ללא קטגוריה"; m[k] = (m[k] || 0) + Number(r.amount || 0); });
      return m;
    };

    const addSheet = (name: string, rows: any[][]) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      (ws as any)["!rtl"] = true;
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    };

    if (reportType === "general" || reportType === "tithe") {
      const summary: any[][] = [["פריט", "סכום (₪)"]];
      summary.push(["סך הכנסות", fmt(sumIncome)]);
      summary.push(["סך הוצאות", fmt(sumExpense)]);
      summary.push(["יתרה", fmt(sumIncome - sumExpense)]);
      summary.push(["מעשר צפוי (10%)", fmt(Math.round(sumIncome * 0.1))]);
      summary.push(["מעשר שולם", fmt(sumTithe)]);
      summary.push(["נותר לתשלום", fmt(Math.max(Math.round(sumIncome * 0.1) - sumTithe, 0))]);
      addSheet("סיכום", summary);
    }

    if (reportType === "general" || reportType === "income") {
      const rows: any[][] = [["תאריך", "תאריך עברי", "סוג", "קטגוריה", "סכום", "סטטוס", "הערות"]];
      incomeRows.forEach((r: any) => rows.push([
        r.income_date ? format(new Date(r.income_date), "dd/MM/yyyy") : "",
        gregWithHebrew(r.income_date).split("(")[1]?.replace(")", "") || "",
        r.type || "", r.category || "", Number(r.amount || 0), r.status || "", r.notes || "",
      ]));
      addSheet("הכנסות", rows);
    }

    if (reportType === "general" || reportType === "expense") {
      const rows: any[][] = [["תאריך", "תאריך עברי", "סוג", "קטגוריה", "סכום", "סטטוס", "הערות"]];
      expenseRows.forEach((r: any) => rows.push([
        r.expense_date ? format(new Date(r.expense_date), "dd/MM/yyyy") : "",
        gregWithHebrew(r.expense_date).split("(")[1]?.replace(")", "") || "",
        r.type || "", r.category || "", Number(r.amount || 0), r.status || "", r.notes || "",
      ]));
      addSheet("הוצאות", rows);
    }

    if (reportType === "general" || reportType === "tithe") {
      const rows: any[][] = [["תאריך", "תאריך עברי", "למי ניתן", "סכום", "הערות"]];
      titheRows.forEach((r: any) => rows.push([
        r.tithe_date ? format(new Date(r.tithe_date), "dd/MM/yyyy") : "",
        gregWithHebrew(r.tithe_date).split("(")[1]?.replace(")", "") || "",
        r.recipient || "", Number(r.amount || 0), r.notes || "",
      ]));
      addSheet("מעשרות", rows);
    }

    if (reportType === "categories") {
      const filteredInc = incomeRows.filter((r: any) => selectedCats.includes(r.category));
      const filteredExp = expenseRows.filter((r: any) => selectedCats.includes(r.category));
      const incByCat = groupBy(filteredInc, "category");
      const expByCat = groupBy(filteredExp, "category");
      const sum: any[][] = [["קטגוריה", "הכנסות", "הוצאות", "נטו"]];
      selectedCats.forEach((c) => sum.push([c, fmt(incByCat[c] || 0), fmt(expByCat[c] || 0), fmt((incByCat[c] || 0) - (expByCat[c] || 0))]));
      addSheet("סיכום קטגוריות", sum);
      selectedCats.forEach((c) => {
        const rows: any[][] = [["תאריך", "סוג פעולה", "סוג", "סכום", "הערות"]];
        filteredInc.filter((r: any) => r.category === c).forEach((r: any) => rows.push([format(new Date(r.income_date), "dd/MM/yyyy"), "הכנסה", r.type || "", Number(r.amount || 0), r.notes || ""]));
        filteredExp.filter((r: any) => r.category === c).forEach((r: any) => rows.push([format(new Date(r.expense_date), "dd/MM/yyyy"), "הוצאה", r.type || "", Number(r.amount || 0), r.notes || ""]));
        if (rows.length > 1) addSheet(c, rows);
      });
    }

    if (reportType === "analysis") {
      const incByCat = groupBy(incomeRows, "category");
      const expByCat = groupBy(expenseRows, "category");
      const sum: any[][] = [["קטגוריה", "סוג", "סה\"כ", "מקום לשיפור", "יעד"]];
      Object.entries(incByCat).forEach(([c, v]) => sum.push([c, "הכנסות", fmt(v), "", ""]));
      Object.entries(expByCat).forEach(([c, v]) => sum.push([c, "הוצאות", fmt(v), "", ""]));
      addSheet("ניתוח", sum);
      const all = Array.from(new Set([...Object.keys(incByCat), ...Object.keys(expByCat)]));
      all.forEach((c) => {
        const rows: any[][] = [["תאריך", "סוג פעולה", "סוג", "סכום", "הערות"]];
        incomeRows.filter((r: any) => (r.category || "ללא קטגוריה") === c).forEach((r: any) => rows.push([format(new Date(r.income_date), "dd/MM/yyyy"), "הכנסה", r.type || "", Number(r.amount || 0), r.notes || ""]));
        expenseRows.filter((r: any) => (r.category || "ללא קטגוריה") === c).forEach((r: any) => rows.push([format(new Date(r.expense_date), "dd/MM/yyyy"), "הוצאה", r.type || "", Number(r.amount || 0), r.notes || ""]));
        if (rows.length > 1) addSheet(c, rows);
      });
    }

    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  };

  const buildPdf = async (incomeRows: any[], expenseRows: any[], titheRows: any[], label: string): Promise<Blob> => {
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
    doc.text(t(`הופק: ${gregWithHebrew(new Date())}`), 200, 29, { align: "right" });

    const sumIncome = incomeRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const sumExpense = expenseRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const sumTithe = titheRows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
    const balance = sumIncome - sumExpense;

    const groupBy = (rows: any[], key: string) => {
      const m: Record<string, number> = {};
      rows.forEach((r: any) => { const k = r[key] || "ללא קטגוריה"; m[k] = (m[k] || 0) + Number(r.amount || 0); });
      return m;
    };

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

    const detailHead = (_kind: "income" | "expense") => [[t("סכום"), t("קטגוריה"), t("סוג"), t("תאריך")]];
    const detailBody = (rows: any[], dateField: string) => rows.map((r: any) => [
      fmtNum(Number(r.amount)), t(r.category || "-"), t(r.type || "-"), gregWithHebrew(r[dateField]),
    ]);

    let cursorY = 38;

    if (reportType === "general") {
      autoTable(doc, { startY: cursorY, head: [[t("סכום (₪)"), t("פריט")]],
        body: [[fmtNum(sumIncome), t("סך הכנסות")], [fmtNum(sumExpense), t("סך הוצאות")], [fmtNum(balance), t("יתרה / תזרים")], [fmtNum(sumTithe), t("מעשרות שולמו")]],
        styles: { font: baseFont, halign: "right", fontSize: 11 }, headStyles: { fillColor: [22, 78, 99], halign: "right" } });
      cursorY = (doc as any).lastAutoTable.finalY + 8;
      cursorY = drawCompareBar(cursorY, "השוואה ויזואלית", [
        { label: "הכנסות", value: sumIncome, color: [34, 197, 94] },
        { label: "הוצאות", value: sumExpense, color: [239, 68, 68] },
        { label: "מעשרות", value: sumTithe, color: [99, 102, 241] },
      ]);
      const incByCat = groupBy(incomeRows, "category");
      const expByCat = groupBy(expenseRows, "category");
      const incEntries = Object.entries(incByCat).sort((a, b) => b[1] - a[1]);
      const expEntries = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
      if (incEntries.length) cursorY = drawCompareBar(cursorY + 4, "הכנסות לפי קטגוריה", incEntries.map(([k, v]) => ({ label: k, value: v, color: [34, 197, 94] })));
      if (expEntries.length) cursorY = drawCompareBar(cursorY + 4, "הוצאות לפי קטגוריה", expEntries.map(([k, v]) => ({ label: k, value: v, color: [239, 68, 68] })));
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
          body: titheRows.map((r: any) => [fmtNum(r.amount), t(r.recipient || "-"), t(r.notes || "-"), gregWithHebrew(r.tithe_date)]),
          styles: { font: baseFont, halign: "right", fontSize: 10 }, headStyles: { fillColor: [99, 102, 241], halign: "right" },
          didDrawPage: (d) => { doc.setFontSize(12); doc.text(t("פירוט מעשרות"), 200, d.settings.startY! - 4, { align: "right" }); } });
      }
    } else if (reportType === "tithe") {
      autoTable(doc, { startY: cursorY, head: [[t("סכום (₪)"), t("פריט")]],
        body: [[fmtNum(sumIncome), t("סך הכנסות")], [fmtNum(Math.round(sumIncome * 0.1)), t("מעשר צפוי (10%)")], [fmtNum(sumTithe), t("מעשר שולם")], [fmtNum(Math.max(Math.round(sumIncome * 0.1) - sumTithe, 0)), t("נותר לתשלום")]],
        styles: { font: baseFont, halign: "right", fontSize: 11 }, headStyles: { fillColor: [99, 102, 241], halign: "right" } });
      autoTable(doc, { startY: (doc as any).lastAutoTable.finalY + 10,
        head: [[t("סכום"), t("למי ניתן"), t("הערות"), t("תאריך")]],
        body: titheRows.map((r: any) => [fmtNum(r.amount), t(r.recipient || "-"), t(r.notes || "-"), gregWithHebrew(r.tithe_date)]),
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
      autoTable(doc, { startY: cursorY, head: [[t("נטו"), t("הוצאות"), t("הכנסות"), t("קטגוריה")]],
        body: summary, styles: { font: baseFont, halign: "right", fontSize: 11 },
        headStyles: { fillColor: [22, 78, 99], halign: "right" } });
      let y = (doc as any).lastAutoTable.finalY + 10;
      selectedCats.forEach((c) => {
        const rows = [
          ...filteredInc.filter((r: any) => r.category === c).map((r: any) => [fmtNum(r.amount), t("הכנסה"), t(r.type || "-"), gregWithHebrew(r.income_date)]),
          ...filteredExp.filter((r: any) => r.category === c).map((r: any) => [fmtNum(r.amount), t("הוצאה"), t(r.type || "-"), gregWithHebrew(r.expense_date)]),
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
      let y = cursorY;
      const renderSection = (cat: string, kind: "income" | "expense") => {
        const sum = kind === "income" ? (incByCat[cat] || 0) : (expByCat[cat] || 0);
        const rows = (kind === "income" ? incomeRows : expenseRows).filter((r: any) => (r.category || "ללא קטגוריה") === cat);
        if (!rows.length) return;
        autoTable(doc, { startY: y,
          head: [[t("יעד"), t("מקום לשיפור"), t("סה״כ ₪"), t(`${kind === "income" ? "הכנסות" : "הוצאות"} — ${cat}`)]],
          body: [["", "", fmtNum(sum), ""]],
          styles: { font: baseFont, halign: "right", fontSize: 12, minCellHeight: 14 },
          headStyles: { fillColor: kind === "income" ? [22, 163, 74] : [220, 38, 38], halign: "right", fontSize: 12 },
          columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 38 } } });
        y = (doc as any).lastAutoTable.finalY + 2;
        autoTable(doc, { startY: y,
          head: [[t("סכום"), t("סוג"), t("תאריך")]],
          body: rows.map((r: any) => [fmtNum(r.amount), t(r.type || "-"), gregWithHebrew(r[kind === "income" ? "income_date" : "expense_date"])]),
          styles: { font: baseFont, halign: "right", fontSize: 9 }, headStyles: { fillColor: [148, 163, 184], halign: "right" } });
        y = (doc as any).lastAutoTable.finalY + 8;
      };
      Object.keys(incByCat).forEach((c) => renderSection(c, "income"));
      Object.keys(expByCat).forEach((c) => renderSection(c, "expense"));
    }

    return doc.output("blob");
  };

  const handleAction = async (delivery: "download" | "email") => {
    if (!user) return;
    if (period === "range" && (!rangeStart || !rangeEnd)) { toast({ title: "יש לבחור טווח תאריכים", variant: "destructive" }); return; }
    if (usePassword && fileFormat === "pdf" && !password) { toast({ title: "יש להזין סיסמא", variant: "destructive" }); return; }
    if (reportType === "categories" && selectedCats.length === 0) { toast({ title: "יש לבחור לפחות קטגוריה אחת", variant: "destructive" }); return; }

    setLoading(delivery);
    try {
      const { from, to, label } = getRange();
      const fromIso = from.toISOString(); const toIso = to.toISOString();
      const [incomeRes, expensesRes, tithesRes] = await Promise.all([
        supabase.from("income").select("*").eq("user_id", user.id).gte("income_date", fromIso).lte("income_date", toIso).order("income_date"),
        supabase.from("expenses").select("*").eq("user_id", user.id).gte("expense_date", fromIso).lte("expense_date", toIso).order("expense_date"),
        supabase.from("tithes").select("*").eq("user_id", user.id).gte("tithe_date", fromIso).lte("tithe_date", toIso).order("tithe_date"),
      ]);
      let incomeRows = incomeRes.data ?? [];
      let expenseRows = expensesRes.data ?? [];
      const titheRows = tithesRes.data ?? [];

      // Apply user filters
      if (filterPaymentMethods.length > 0) {
        incomeRows = incomeRows.filter((r: any) => filterPaymentMethods.includes(r.payment_method || "ללא"));
        expenseRows = expenseRows.filter((r: any) => filterPaymentMethods.includes(r.payment_method || "ללא"));
      }
      if (filterCategories.length > 0) {
        incomeRows = incomeRows.filter((r: any) => filterCategories.includes(r.category || ""));
        expenseRows = expenseRows.filter((r: any) => filterCategories.includes(r.category || ""));
      }
      if (filterKind === "income") expenseRows = [];
      if (filterKind === "expense") incomeRows = [];

      const safeLabel = label.replace(/[/\\: ]/g, "-");

      // Build files: for email send both formats; for download only the chosen one
      const formats: FileFormat[] = delivery === "email" ? ["pdf", "xlsx"] : [fileFormat];
      const files: { name: string; blob: Blob; ext: FileFormat }[] = [];
      for (const fmt of formats) {
        const blob = fmt === "pdf"
          ? await buildPdf(incomeRows, expenseRows, titheRows, label)
          : await buildXlsx(incomeRows, expenseRows, titheRows, label);
        files.push({ name: `${reportType}_${safeLabel}.${fmt}`, blob, ext: fmt });
      }

      if (delivery === "download") {
        const f = files[0];
        const url = URL.createObjectURL(f.blob);
        const a = document.createElement("a"); a.href = url; a.download = f.name; a.click();
        URL.revokeObjectURL(url);
        toast({ title: "הדוח הופק בהצלחה" });
      } else {
        // upload both to storage and open mailto with signed links
        const links: string[] = [];
        for (const f of files) {
          const path = `${user.id}/${Date.now()}-${f.name}`;
          const up = await supabase.storage.from("reports").upload(path, f.blob, { contentType: f.blob.type, upsert: true });
          if (up.error) throw up.error;
          const signed = await supabase.storage.from("reports").createSignedUrl(path, 60 * 60 * 24 * 7);
          if (signed.error) throw signed.error;
          links.push(`${f.ext.toUpperCase()}: ${signed.data.signedUrl}`);
        }
        const subject = encodeURIComponent(`דוח: ${reportType} — ${label}`);
        const body = encodeURIComponent(`שלום,\n\nמצורפים קישורי הורדה לדוח (תקפים ל-7 ימים):\n\n${links.join("\n\n")}\n\nבברכה`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        toast({ title: "נפתח חלון מייל", description: "הקבצים הועלו וקישורי הורדה צורפו" });
      }

      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "שגיאה בהפקת הדוח", description: e.message, variant: "destructive" });
    } finally { setLoading(null); }
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

          <div className="space-y-3 p-3 rounded-xl bg-muted/20 border border-border/50">
            <Label className="font-semibold text-xs">סינונים נוספים</Label>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">סוג רשומות</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: "all", l: "הכל" },
                  { v: "income", l: "הכנסות" },
                  { v: "expense", l: "הוצאות" },
                ] as const).map((o) => (
                  <button key={o.v} type="button" onClick={() => setFilterKind(o.v)}
                    className={`p-2 rounded-lg border text-xs transition-all ${filterKind === o.v ? "border-primary bg-primary/10 font-semibold" : "border-border bg-background"}`}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">אופן ביצוע</p>
              <div className="flex flex-wrap gap-1.5">
                {["אשראי", "מזומן", "בנקאי", "אחר", "ללא"].map((m) => {
                  const checked = filterPaymentMethods.includes(m);
                  return (
                    <label key={m} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-xs ${checked ? "bg-primary/10 border-primary" : "border-border bg-background"}`}>
                      <Checkbox checked={checked} onCheckedChange={() => setFilterPaymentMethods((p) => p.includes(m) ? p.filter(x => x !== m) : [...p, m])} />
                      {m}
                    </label>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">ללא בחירה = הכל</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">קטגוריות</p>
              {allCats.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">אין קטגוריות</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {allCats.map((c) => {
                    const checked = filterCategories.includes(c);
                    return (
                      <label key={c} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer text-xs ${checked ? "bg-primary/10 border-primary" : "border-border bg-background"}`}>
                        <Checkbox checked={checked} onCheckedChange={() => setFilterCategories((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} />
                        {c}
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">ללא בחירה = הכל</p>
            </div>
          </div>


          <div className="space-y-2">
            <Label className="font-semibold text-xs flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> תקופת הדוח</Label>
            <Select value={period} onValueChange={(v) => {
              const p = v as Period; setPeriod(p);
              const now = new Date();
              if (p === "monthly") { setRangeStart(format(startOfMonth(now), "yyyy-MM-dd")); setRangeEnd(format(endOfMonth(now), "yyyy-MM-dd")); }
              else if (p === "quarterly") { setRangeStart(format(startOfQuarter(now), "yyyy-MM-dd")); setRangeEnd(format(endOfQuarter(now), "yyyy-MM-dd")); }
              else if (p === "yearly") { setRangeStart(format(startOfYear(now), "yyyy-MM-dd")); setRangeEnd(format(endOfYear(now), "yyyy-MM-dd")); }
            }}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="monthly">חודשי (חודש נוכחי)</SelectItem>
                <SelectItem value="quarterly">רבעוני (רבעון נוכחי)</SelectItem>
                <SelectItem value="yearly">שנתי (שנה נוכחית)</SelectItem>
                <SelectItem value="range">בחירת טווח מותאם</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className="font-semibold text-xs">מתאריך</Label><Input type="date" value={rangeStart} onChange={(e) => { setRangeStart(e.target.value); setPeriod("range"); }} className="rounded-xl" dir="ltr" /></div>
            <div className="space-y-2"><Label className="font-semibold text-xs">עד תאריך</Label><Input type="date" value={rangeEnd} onChange={(e) => { setRangeEnd(e.target.value); setPeriod("range"); }} className="rounded-xl" dir="ltr" /></div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-xs">פורמט קובץ (להורדה)</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setFileFormat("pdf")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${fileFormat === "pdf" ? "border-primary bg-primary/10 font-semibold" : "border-border bg-background"}`}>
                <FileType className="h-4 w-4" /> PDF
              </button>
              <button type="button" onClick={() => setFileFormat("xlsx")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${fileFormat === "xlsx" ? "border-primary bg-primary/10 font-semibold" : "border-background bg-background"} ${fileFormat === "xlsx" ? "border-primary" : ""}`}>
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">בשליחה למייל יישלחו שני סוגי הקבצים (PDF + Excel)</p>
          </div>

          {fileFormat === "pdf" && (
            <div className="rounded-xl border border-border/50 p-3 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> הגן על הקובץ בסיסמא</Label>
                <Switch checked={usePassword} onCheckedChange={setUsePassword} />
              </div>
              {usePassword && <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="הזן סיסמא לקובץ ה-PDF" className="rounded-xl" />}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-border/50">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">ביטול</Button>
          <Button onClick={() => handleAction("email")} disabled={!!loading} variant="outline" className="rounded-xl gap-1.5">
            <Mail className="h-4 w-4" />{loading === "email" ? "מכין..." : "שליחה למייל"}
          </Button>
          <Button onClick={() => handleAction("download")} disabled={!!loading} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
            <Download className="h-4 w-4" />{loading === "download" ? "מפיק..." : "הורדה"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
