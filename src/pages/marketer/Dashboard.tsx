import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Users, UserCheck, CheckSquare, Percent } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const recentLeads = [
  { name: "אברהם כהן", phone: "050-1234567", status: "חדש", date: "10/03/2026" },
  { name: "שרה לוי", phone: "052-7654321", status: "בטיפול", date: "08/03/2026" },
  { name: "משה דוד", phone: "054-9876543", status: "ממתין", date: "05/03/2026" },
];

const urgentTasks = [
  { title: "שיחה עם אברהם כהן", dueDate: "11/03/2026", priority: "דחוף" },
  { title: "שליחת הצעה לשרה לוי", dueDate: "12/03/2026", priority: "דחוף" },
  { title: "מעקב אחר משה דוד", dueDate: "13/03/2026", priority: "רגיל" },
];

const weeklyData = [
  { day: "א", leads: 3 }, { day: "ב", leads: 5 }, { day: "ג", leads: 2 },
  { day: "ד", leads: 7 }, { day: "ה", leads: 4 }, { day: "ו", leads: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-lg">
      <p className="font-bold text-foreground text-sm">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function MarketerDashboard() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold gradient-text">דשבורד משווק</h1>
        <p className="text-muted-foreground mt-1">מבט כללי על הפעילות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="לידים לטיפול" value={8} icon={Users} trend="+2 היום" trendUp iconClassName="bg-primary/10 text-primary" delay={0} />
        <StatCard title="לקוחות פעילים" value={15} icon={UserCheck} iconClassName="bg-success/10 text-success" delay={50} />
        <StatCard title="משימות פתוחות" value={5} icon={CheckSquare} iconClassName="bg-chart-3/10 text-chart-3" delay={100} />
        <StatCard title="יתרת עמלות" value="₪3,200" icon={Percent} trend="לחודש מרץ" iconClassName="bg-primary/10 text-primary" delay={150} />
      </div>

      <Card className="card-premium animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">לידים השבוע</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barCategoryGap="25%">
              <defs>
                <linearGradient id="mkBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" name="לידים" fill="url(#mkBarGrad)" radius={[10, 10, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-premium animate-slide-up" style={{ animationDelay: "150ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">3 לידים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone} · {lead.date}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="card-premium animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">3 משימות דחופות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {urgentTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                </div>
                <StatusBadge status={task.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
