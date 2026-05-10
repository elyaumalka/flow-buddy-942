import { DataTable, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, CheckCircle, TrendingUp } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const columns = [
  { key: "month", header: "חודש" },
  { key: "amount", header: "סכום עמלה", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["שולם", "לא שולם", "ממתין"] },
  { key: "month", label: "חודש" },
];

export default function MarketerCommissions() {
  const { data } = useSupabaseTable("commissions");

  const total = data.reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const paid = data.filter((c: any) => c.status === "שולם").reduce((sum, c: any) => sum + Number(c.amount || 0), 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  const chartData = data.slice(0, 6).map((c: any) => ({
    month: c.month,
    amount: Number(c.amount || 0),
  })).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">עמלות</h1>
        <p className="text-muted-foreground">סיכום העמלות שלך</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="סה״כ עמלות" value={`₪${total.toLocaleString()}`} icon={Percent} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="סה״כ שולם" value={`₪${paid.toLocaleString()}`} icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="ממוצע" value={`₪${avg.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      {chartData.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">עמלות לפי חודשים</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Bar dataKey="amount" name="עמלה" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <DataTable data={data} columns={columns} title="היסטוריית עמלות" filters={filters} />
    </div>
  );
}
