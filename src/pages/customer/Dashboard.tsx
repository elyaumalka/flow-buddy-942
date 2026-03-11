import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דשבורד</h1>
        <p className="text-muted-foreground">מבט כללי על המצב הפיננסי שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="הכנסות החודש" value="₪21,200" icon={TrendingUp} trend="+12% מהחודש שעבר" trendUp iconClassName="bg-success/10 text-success" />
        <StatCard title="הוצאות החודש" value="₪13,730" icon={TrendingDown} trend="-5% מהחודש שעבר" trendUp iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="יתרה נוכחית" value="₪7,470" icon={Wallet} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="עמידה ביעד" value="82%" icon={Target} trend="יעד: ₪25,000" iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">תזרים מזומנים - 6 חודשים אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
              <Area type="monotone" dataKey="income" name="הכנסות" fill="hsl(var(--chart-2) / 0.2)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="הוצאות" fill="hsl(var(--chart-5) / 0.2)" stroke="hsl(var(--chart-5))" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">תנועות אחרונות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{t.desc}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                {t.amount}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
