import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <div className="space-y-6">
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
    </div>
  );
}
