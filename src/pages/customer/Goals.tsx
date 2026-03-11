import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const monthlyGoalData = [
  { week: "שבוע 1", actual: 5200, target: 6250 },
  { week: "שבוע 2", actual: 11800, target: 12500 },
  { week: "שבוע 3", actual: 16400, target: 18750 },
  { week: "שבוע 4", actual: 20500, target: 25000 },
];

const yearlyGoalData = [
  { month: "ינו", income: 18000, target: 20000 },
  { month: "פבר", income: 17500, target: 20000 },
  { month: "מרץ", income: 22700, target: 25000 },
  { month: "אפר", income: 0, target: 25000 },
  { month: "מאי", income: 0, target: 25000 },
  { month: "יוני", income: 0, target: 25000 },
];

const goals = [
  { title: "יעד הכנסות חודשי", current: 22700, target: 25000, type: "income" as const },
  { title: "תקרת הוצאות חודשית", current: 7130, target: 10000, type: "expense" as const },
  { title: "חיסכון חודשי", current: 7470, target: 8000, type: "income" as const },
];

export default function CustomerGoals() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">יעדים</h1>
          <p className="text-muted-foreground">הגדרת יעדים ומעקב אחר עמידה בהם</p>
        </div>
        <Button onClick={() => toast({ title: "הוספת יעד חדש" })}>
          <Plus className="h-4 w-4 ml-2" />
          יעד חדש
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal, i) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          const isGood = goal.type === "expense" ? pct <= 100 : pct >= 80;
          return (
            <Card key={i} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {goal.type === "income" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <CardTitle className="text-sm">{goal.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">₪{goal.current.toLocaleString()}</span>
                  <span className="font-medium">₪{goal.target.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(pct, 100)} className="h-2" />
                <p className={`text-xs font-medium ${isGood ? "text-success" : "text-destructive"}`}>
                  {pct}% מהיעד
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">עמידה ביעד - חודש נוכחי</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyGoalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Bar dataKey="actual" name="בפועל" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="יעד" fill="hsl(var(--chart-1) / 0.3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">עמידה ביעד - שנתי</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yearlyGoalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₪${Number(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="income" name="הכנסות" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" name="יעד" stroke="hsl(var(--chart-1))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
