import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ClipboardList } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

const incomeVsExpense = [
  { month: "ינו", income: 42000, expense: 18000 },
  { month: "פבר", income: 38000, expense: 15000 },
  { month: "מרץ", income: 55000, expense: 22000 },
  { month: "אפר", income: 47000, expense: 19000 },
  { month: "מאי", income: 61000, expense: 25000 },
  { month: "יוני", income: 58000, expense: 21000 },
];

const leadSources = [
  { name: "אתר", value: 35 },
  { name: "הפניה", value: 25 },
  { name: "טלפון", value: 20 },
  { name: "פייסבוק", value: 15 },
  { name: "אחר", value: 5 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const conversionData = [
  { month: "ינו", rate: 32 },
  { month: "פבר", rate: 28 },
  { month: "מרץ", rate: 41 },
  { month: "אפר", rate: 35 },
  { month: "מאי", rate: 45 },
  { month: "יוני", rate: 38 },
];

export default function AdminStatistics() {
  const { data: income } = useSupabaseTable<any>("income", { userScoped: true });
  const { data: expenses } = useSupabaseTable<any>("expenses", { userScoped: true });

  const [entrySource, setEntrySource] = useState<string>("all"); // all | income | expense

  // "אופן הזנת נתונים" — how customers enter data, grouped by a notional source (payment_method / category).
  const entryRows = useMemo(() => {
    const rows: { method: string; kind: string }[] = [];
    if (entrySource === "all" || entrySource === "income")
      (income || []).forEach((r: any) => rows.push({ method: r.payment_method || r.category || "לא צוין", kind: "הכנסה" }));
    if (entrySource === "all" || entrySource === "expense")
      (expenses || []).forEach((r: any) => rows.push({ method: r.payment_method || r.category || "לא צוין", kind: "הוצאה" }));
    return rows;
  }, [income, expenses, entrySource]);

  const entryCounts = useMemo(() => {
    const map = new Map<string, number>();
    entryRows.forEach((r) => map.set(r.method, (map.get(r.method) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [entryRows]);

  const exportEntries = () => {
    const sheetData = entryCounts.map((e) => ({ "אופן הזנה": e.name, "כמות רשומות": e.count }));
    const ws = XLSX.utils.json_to_sheet(sheetData.length ? sheetData : [{ "אופן הזנה": "אין נתונים", "כמות רשומות": 0 }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "אופן הזנת נתונים");
    XLSX.writeFile(wb, "data-entry-stats.xlsx");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">סטטיסטיקות</h1>
        <p className="text-muted-foreground">גרפים ונתונים סטטיסטיים</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">הכנסות מול הוצאות</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Bar dataKey="income" name="הכנסות" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="הוצאות" fill="hsl(var(--chart-5))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">מקורות לידים</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={leadSources} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {leadSources.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader><CardTitle className="text-base">שיעור המרה (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="rate" name="שיעור המרה" fill="hsl(var(--chart-2) / 0.2)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* אופן הזנת נתונים */}
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">אופן הזנת נתונים</CardTitle>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">סוג רשומה</Label>
                <Select value={entrySource} onValueChange={setEntrySource}>
                  <SelectTrigger className="rounded-xl h-9 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="income">הכנסות</SelectItem>
                    <SelectItem value="expense">הוצאות</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={exportEntries}>
                <Download className="h-4 w-4 ml-1" /> ייצוא לאקסל
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            כיצד לקוחות מזינים נתונים — ספירת רשומות לפי אופן ההזנה (סה״כ {entryRows.length} רשומות).
          </p>
          {entryCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">אין נתונים להצגה</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={entryCounts}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => `${v} רשומות`} />
                <Bar dataKey="count" name="כמות רשומות" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
