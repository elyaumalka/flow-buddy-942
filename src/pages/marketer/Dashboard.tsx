import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Users, UserCheck, CheckSquare, Percent } from "lucide-react";

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

export default function MarketerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דשבורד משווק</h1>
        <p className="text-muted-foreground">מבט כללי על הפעילות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="לידים לטיפול" value={8} icon={Users} trend="+2 היום" trendUp iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לקוחות פעילים" value={15} icon={UserCheck} iconClassName="bg-success/10 text-success" />
        <StatCard title="משימות פתוחות" value={5} icon={CheckSquare} iconClassName="bg-chart-3/10 text-chart-3" />
        <StatCard title="יתרת עמלות" value="₪3,200" icon={Percent} trend="לחודש מרץ" iconClassName="bg-primary/10 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">3 לידים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone} · {lead.date}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">3 משימות דחופות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
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
