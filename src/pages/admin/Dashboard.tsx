import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Users, UserPlus, DollarSign, Percent, UserCheck, TrendingUp, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";

const revenueData = [
  { month: "ינו", amount: 42000 },
  { month: "פבר", amount: 38000 },
  { month: "מרץ", amount: 55000 },
  { month: "אפר", amount: 47000 },
  { month: "מאי", amount: 61000 },
  { month: "יוני", amount: 58000 },
];

const leadsData = [
  { month: "ינו", leads: 24, converted: 12 },
  { month: "פבר", leads: 31, converted: 18 },
  { month: "מרץ", leads: 28, converted: 15 },
  { month: "אפר", leads: 42, converted: 25 },
  { month: "מאי", leads: 35, converted: 20 },
  { month: "יוני", leads: 48, converted: 30 },
];

const conversionData = [
  { name: "שיעור המרה", value: 62, fill: "hsl(var(--primary))" },
];

const recentTickets = [
  { id: 1, customer: "יוסי כהן", subject: "בעיית חיוב", date: "10/03/2026", status: "חדש" },
  { id: 2, customer: "רחל לוי", subject: "שינוי חבילה", date: "09/03/2026", status: "בטיפול" },
  { id: 3, customer: "דוד אברהם", subject: "שאלה על דוח", date: "08/03/2026", status: "הושלם" },
  { id: 4, customer: "שרה מזרחי", subject: "בקשת החזר", date: "07/03/2026", status: "ממתין" },
];

const topMarketers = [
  { name: "אבי ישראלי", leads: 28, revenue: "₪14,200", pct: 92 },
  { name: "מיכל דוד", leads: 22, revenue: "₪11,800", pct: 78 },
  { name: "נתן ברק", leads: 18, revenue: "₪9,400", pct: 65 },
];

const upcomingTasks = [
  { title: "שיחה עם ליד חדש", date: "11/03/2026", priority: "דחוף" },
  { title: "שליחת חשבונית ללקוח", date: "12/03/2026", priority: "רגיל" },
  { title: "בדיקת תקלה במערכת", date: "13/03/2026", priority: "דחוף" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-lg">
      <p className="font-bold text-foreground text-sm mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? `₪${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold gradient-text">דשבורד</h1>
        <p className="text-muted-foreground mt-1">מבט כללי על המערכת</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="לידים לטיפול" value={12} icon={Users} trend="+3 היום" trendUp iconClassName="bg-primary/10 text-primary" delay={0} />
        <StatCard title="לידים חדשים" value={48} icon={UserPlus} trend="+15% מהחודש שעבר" trendUp iconClassName="bg-success/10 text-success" delay={50} />
        <StatCard title="הכנסות החודש" value="₪58,400" icon={DollarSign} trend="+8.2%" trendUp iconClassName="bg-success/10 text-success" delay={100} />
        <StatCard title="עמלות לתשלום" value="₪4,820" icon={Percent} iconClassName="bg-chart-3/10 text-chart-3" delay={150} />
        <StatCard title="מנויים פעילים" value={186} icon={UserCheck} trend="+5 החודש" trendUp iconClassName="bg-primary/10 text-primary" delay={200} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-premium animate-slide-up lg:col-span-2" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">הכנסות חודשיות</CardTitle>
              <div className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3" /> +8.2%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="הכנסות" fill="url(#barGrad)" radius={[10, 10, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-premium animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">שיעור המרה</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={14} data={conversionData} startAngle={180} endAngle={-180}>
                <defs>
                  <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" fill="url(#radialGrad)" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-24">
              <p className="text-4xl font-extrabold gradient-text">62%</p>
              <p className="text-sm text-muted-foreground mt-1">מלידים ללקוחות</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-premium animate-slide-up" style={{ animationDelay: "150ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">לידים והמרות</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={leadsData}>
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" name="לידים" fill="url(#leadsGrad)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }} />
              <Area type="monotone" dataKey="converted" name="הומרו" fill="url(#convertGrad)" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 2, stroke: "hsl(var(--card))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-premium animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">פניות אחרונות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{t.customer}</p>
                  <p className="text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-premium animate-slide-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">משווקים מובילים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMarketers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{m.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full transition-all duration-700" style={{ width: `${m.pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{m.pct}%</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-success">{m.revenue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-premium animate-slide-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">משימות קרובות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingTasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
