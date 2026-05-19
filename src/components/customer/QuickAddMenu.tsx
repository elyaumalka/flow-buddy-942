import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { IncomeFormDialog, IncomeFormData } from "@/components/customer/IncomeFormDialog";
import { ExpenseFormDialog, ExpenseFormData } from "@/components/customer/ExpenseFormDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";

export function QuickAddMenu() {
  const { toast } = useToast();
  const { insert: insertIncome } = useSupabaseTable("income", { userScoped: true });
  const { insert: insertExpense } = useSupabaseTable("expenses", { userScoped: true });
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const handleIncome = async (data: IncomeFormData) => {
    await insertIncome(data as any);
    toast({ title: "הכנסה נוספה בהצלחה" });
  };
  const handleExpense = async (data: ExpenseFormData) => {
    await insertExpense(data as any);
    toast({ title: "הוצאה נוספה בהצלחה" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5 font-bold"
          >
            <Plus className="h-4 w-4" />
            הוספה מהירה
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="rounded-xl w-44">
          <DropdownMenuItem onClick={() => setIncomeOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <TrendingUp className="h-4 w-4 text-success" />
            הכנסה חדשה
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExpenseOpen(true)} className="gap-2 cursor-pointer rounded-lg">
            <TrendingDown className="h-4 w-4 text-destructive" />
            הוצאה חדשה
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IncomeFormDialog open={incomeOpen} onOpenChange={setIncomeOpen} onSave={handleIncome} />
      <ExpenseFormDialog open={expenseOpen} onOpenChange={setExpenseOpen} onSave={handleExpense} />
    </>
  );
}
