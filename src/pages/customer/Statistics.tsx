import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const incomeVsExpense = [
  { month: "ינו", income: 18000, expenses: 12000 },
  { month: "פבר", income: 17500, expenses: 13500 },
  { month: "מרץ", income: 22700, expenses: 7130 },
  { month: "אפר", income: 19000, expenses: 11000 },
  { month: "מאי", income: 21000, expenses: 15000 },
  { month: "יוני", income: 20000, expenses: 13000 },
];

const expenseCategories = [
  { name: "שכר דירה", value: 4500 },
  { name: "מזון", value: 850 },
  { name: "חשמל", value: 380 },
  { name: "אינטרנט", value: 200 },
  { name: "ביגוד", value: 1200 },
];

const incomeCategories = [
  { name: "משכורת", value: 18000 },
  { name: "פרילנס", value: 3200 },
  { name: "שכ״ד", value: 1500 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const savingsData = [
  { month: "ינו", savings: 6000 },
  { month: "פבר", savings: 4000 },
  { month: "מרץ", savings: 15570 },
  { month: "אפר", savings: 8000 },
  { month: "מאי", savings: 6000 },
  { month: "יוני", savings: 7000 },
];

export default function CustomerStatistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">סטטיסטיקות</h1>
        <p className="text-muted-foreground">ניתוח הכנסות והוצאות</p>
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
                <Bar dataKey="income" name="הכנסות" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="הוצאות" fill="hsl(var(--chart-5))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">חיסכון חודשי</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Area type="monotone" dataKey="savings" name="חיסכון" fill="hsl(var(--chart-2) / 0.2)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">פילוח הוצאות לפי קטגוריה</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expenseCategories} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader><CardTitle className="text-base">פילוח הכנסות לפי קטגוריה</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={incomeCategories} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {incomeCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
