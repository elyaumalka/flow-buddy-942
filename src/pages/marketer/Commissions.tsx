import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, CheckCircle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const monthlyCommissions = [
  { month: "אוק", amount: 1200 },
  { month: "נוב", amount: 1800 },
  { month: "דצמ", amount: 2100 },
  { month: "ינו", amount: 1900 },
  { month: "פבר", amount: 2400 },
  { month: "מרץ", amount: 3200 },
];

const mockCommissions = [
  { month: "מרץ 2026", amount: "₪3,200", proof: "ממתין", status: "לא שולם" },
  { month: "פברואר 2026", amount: "₪2,400", proof: "הועלה", status: "שולם" },
  { month: "ינואר 2026", amount: "₪1,900", proof: "הועלה", status: "שולם" },
  { month: "דצמבר 2025", amount: "₪2,100", proof: "הועלה", status: "שולם" },
];

const columns = [
  { key: "month", header: "חודש" },
  { key: "amount", header: "סכום עמלה" },
  { key: "proof", header: "הוכחת תשלום" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function MarketerCommissions() {
  const totalPaid = "₪8,500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">עמלות</h1>
        <p className="text-muted-foreground">סיכום העמלות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="עמלה החודש" value="₪3,200" icon={Percent} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="סה״כ שולם" value={totalPaid} icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="ממוצע חודשי" value="₪2,100" icon={TrendingUp} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-base">עמלות לפי חודשים (שנה אחרונה)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyCommissions}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" name="עמלה" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DataTable data={mockCommissions} columns={columns} title="היסטוריית עמלות" />
    </div>
  );
}
