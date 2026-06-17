import { useMemo } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight, ClipboardList, Database } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

interface DatedRow { income_date?: string; expense_date?: string; created_at?: string }

const hebMonthsShort = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יוני", "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ"];

const cashFlowData = [
  { month: "ינו", income: 18000, expenses: 12000 },
  { month: "פבר", income: 17500, expenses: 13500 },
  { month: "מרץ", income: 22000, expenses: 14000 },
  { month: "אפר", income: 19000, expenses: 11000 },
  { month: "מאי", income: 21000, expenses: 15000 },
  { month: "יוני", income: 20000, expenses: 13000 },
];

const recentTransactions = [
  { desc: "משכורת חודש מרץ", amount: "+₪18,000", type: "income", date: "01/03/2026" },
  { desc: "שכר דירה", amount: "-₪4,500", type: "expense", date: "01/03/2026" },
  { desc: "סופרמרקט", amount: "-₪850", type: "expense", date: "03/03/2026" },
  { desc: "פרויקט פרילנס", amount: "+₪3,200", type: "income", date: "05/03/2026" },
  { desc: "חשבון חשמל", amount: "-₪380", type: "expense", date: "07/03/2026" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-lg">
      <p className="font-bold text-foreground text-sm mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: ₪{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function CustomerDashboard() {
  const { data: income } = useSupabaseTable<DatedRow>("income", { userScoped: true });
  const { data: expenses } = useSupabaseTable<DatedRow>("expenses", { userScoped: true });

  const { thisMonthCount, totalEntries, activityData } = useMemo(() => {
    const rowDate = (r: DatedRow, kind: "income" | "expense") => {
      const raw = kind === "income" ? r.income_date : r.expense_date;
      const d = new Date(raw ?? r.created_at ?? "");
      return isNaN(d.getTime()) ? null : d;
    };
    const all = [
      ...income.map((r) => rowDate(r, "income")),
      ...expenses.map((r) => rowDate(r, "expense")),
    ].filter((d): d is Date => d != null);

    const now = new Date();
    const thisMonth = all.filter(
      (d) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    ).length;

    // Last 6 months buckets
    const buckets: { key: string; month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: hebMonthsShort[d.getMonth()], count: 0 });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    all.forEach((d) => {
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k);
      if (i != null) buckets[i].count++;
    });

    return { thisMonthCount: thisMonth, totalEntries: all.length, activityData: buckets };
  }, [income, expenses]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold gradient-text">דשבורד</h1>
        <p className="text-muted-foreground mt-1">מבט כללי על המצב הפיננסי שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="הכנסות החודש" value="₪21,200" icon={TrendingUp} trend="+12% מהחודש שעבר" trendUp iconClassName="bg-success/10 text-success" delay={0} />
        <StatCard title="הוצאות החודש" value="₪13,730" icon={TrendingDown} trend="-5% מהחודש שעבר" trendUp iconClassName="bg-destructive/10 text-destructive" delay={50} />
        <StatCard title="יתרה נוכחית" value="₪7,470" icon={Wallet} iconClassName="bg-primary/10 text-primary" delay={100} />
        <StatCard title="עמידה ביעד" value="82%" icon={Target} trend="יעד: ₪25,000" iconClassName="bg-chart-3/10 text-chart-3" delay={150} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="נתונים שהוזנו החודש" value={thisMonthCount} icon={ClipboardList} iconClassName="bg-primary/10 text-primary" delay={0} />
        <StatCard title='סה"כ רשומות' value={totalEntries} icon={Database} iconClassName="bg-chart-3/10 text-chart-3" delay={50} />
      </div>

      <Card className="card-premium animate-slide-up" style={{ animationDelay: "150ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">פעילות הזנת נתונים</CardTitle>
          <p className="text-xs text-muted-foreground">מספר הרשומות שהזנת ב-6 החודשים האחרונים</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary))", fillOpacity: 0.06 }}
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="glass-strong rounded-xl px-4 py-3 shadow-lg">
                      <p className="font-bold text-foreground text-sm mb-1">{label}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--primary))" }}>
                        רשומות: {payload[0].value}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" name="רשומות" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-premium animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">תזרים מזומנים - 6 חודשים אחרונים</CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-primary" /> הכנסות</div>
              <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-chart-5" /> הוצאות</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="הכנסות" fill="url(#incomeGrad)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 3, stroke: "hsl(var(--card))" }} activeDot={{ r: 7 }} />
              <Area type="monotone" dataKey="expenses" name="הוצאות" fill="url(#expenseGrad)" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(var(--chart-5))", strokeWidth: 3, stroke: "hsl(var(--card))" }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-premium animate-slide-up" style={{ animationDelay: "200ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">תנועות אחרונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  t.type === "income" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {t.type === "income"
                    ? <ArrowUpRight className="h-4 w-4 text-success" />
                    : <ArrowDownRight className="h-4 w-4 text-destructive" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                {t.amount}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
