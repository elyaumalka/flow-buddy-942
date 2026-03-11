import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Users,
  UserPlus,
  DollarSign,
  Percent,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
  { month: "ינו", leads: 24 },
  { month: "פבר", leads: 31 },
  { month: "מרץ", leads: 28 },
  { month: "אפר", leads: 42 },
  { month: "מאי", leads: 35 },
  { month: "יוני", leads: 48 },
];

const recentTickets = [
  { id: 1, customer: "יוסי כהן", subject: "בעיית חיוב", date: "10/03/2026", status: "חדש" },
  { id: 2, customer: "רחל לוי", subject: "שינוי חבילה", date: "09/03/2026", status: "בטיפול" },
  { id: 3, customer: "דוד אברהם", subject: "שאלה על דוח", date: "08/03/2026", status: "הושלם" },
  { id: 4, customer: "שרה מזרחי", subject: "בקשת החזר", date: "07/03/2026", status: "ממתין" },
];

const topMarketers = [
  { name: "אבי ישראלי", leads: 28, revenue: "₪14,200" },
  { name: "מיכל דוד", leads: 22, revenue: "₪11,800" },
  { name: "נתן ברק", leads: 18, revenue: "₪9,400" },
];

const upcomingTasks = [
  { title: "שיחה עם ליד חדש", date: "11/03/2026", priority: "דחוף" },
  { title: "שליחת חשבונית ללקוח", date: "12/03/2026", priority: "רגיל" },
  { title: "בדיקת תקלה במערכת", date: "13/03/2026", priority: "דחוף" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דשבורד</h1>
        <p className="text-muted-foreground">מבט כללי על המערכת</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="לידים לטיפול" value={12} icon={Users} trend="+3 היום" trendUp iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לידים חדשים" value={48} icon={UserPlus} trend="+15% מהחודש שעבר" trendUp iconClassName="bg-success/10 text-success" />
        <StatCard title="הכנסות החודש" value="₪58,400" icon={DollarSign} trend="+8.2%" trendUp iconClassName="bg-success/10 text-success" />
        <StatCard title="עמלות לתשלום" value="₪4,820" icon={Percent} iconClassName="bg-chart-3/10 text-chart-3" />
        <StatCard title="מנויים פעילים" value={186} icon={UserCheck} trend="+5 החודש" trendUp iconClassName="bg-primary/10 text-primary" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">הכנסות חודשיות</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">לידים חדשים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">פניות אחרונות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.customer}</p>
                  <p className="text-xs text-muted-foreground">{t.subject}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top marketers */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">משווקים מובילים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMarketers.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.leads} לידים</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-success">{m.revenue}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">משימות קרובות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
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
