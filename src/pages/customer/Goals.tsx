import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { GoalFormDialog, GoalFormData } from "@/components/customer/GoalFormDialog";
import { formatCurrency } from "@/lib/format";

const GOAL_TYPE_LABELS: Record<string, string> = {
  savings: "חיסכון",
  reduce_expenses: "הקטנת הוצאות",
  income: "הכנסה",
};

export default function CustomerGoals() {
  const { toast } = useToast();
  const { data, insert, update } = useSupabaseTable("goals", { userScoped: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (goal: any) => { setEditItem(goal); setDialogOpen(true); };
  const handleSave = async (formData: GoalFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "היעד עודכן" });
    } else {
      await insert(formData);
      toast({ title: "יעד חדש נוסף" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">יעדים</h1>
          <p className="text-muted-foreground">הגדרת יעדים ומעקב אחר עמידה בהם</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 ml-2" />
          יעד חדש
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>אין יעדים עדיין. לחץ על "יעד חדש" כדי להתחיל.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((goal: any) => {
            const isReduce = goal.goal_type === "reduce_expenses";
            const pct = goal.target_amount > 0 ? Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100) : 0;
            const isGood = isReduce ? pct <= 100 : pct >= 80;
            return (
              <Card key={goal.id} className="animate-fade-in cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEdit(goal)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {isReduce ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-success" />
                    )}
                    <CardTitle className="text-sm">{goal.title}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {goal.goal_type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {GOAL_TYPE_LABELS[goal.goal_type] || goal.goal_type}
                      </span>
                    )}
                    {goal.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {goal.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isReduce && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{formatCurrency(goal.current_amount)}</span>
                      <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  )}
                  {isReduce && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">יעד הקטנה</span>
                      <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  )}
                  {!isReduce && (
                    <>
                      <Progress value={Math.min(pct, 100)} className="h-2" />
                      <p className={`text-xs font-medium ${isGood ? "text-success" : "text-destructive"}`}>
                        {pct}% מהיעד
                      </p>
                    </>
                  )}
                  {goal.duration_months ? (
                    <p className="text-xs text-muted-foreground">משך: {goal.duration_months} חודשים</p>
                  ) : null}
                  {goal.goal_type === "savings" && goal.savings_location && (
                    <p className="text-xs text-muted-foreground">מיקום: {goal.savings_location}</p>
                  )}
                  {isReduce && goal.target_date && (
                    <p className="text-xs text-muted-foreground">תאריך יעד: {new Date(goal.target_date).toLocaleDateString("he-IL")}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GoalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
