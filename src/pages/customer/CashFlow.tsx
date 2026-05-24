import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { TrendingUp, TrendingDown, Scale, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { IncomeFormDialog, IncomeFormData } from "@/components/customer/IncomeFormDialog";
import { ExpenseFormDialog, ExpenseFormData } from "@/components/customer/ExpenseFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";

const statusMap: Record<string, string> = {
  "מאושר": "bg-success/10 text-success border-success/20",
  "לאישור": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "צפוי": "bg-primary/10 text-primary border-primary/20",
};

const incomeColumns = [
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "income_date", header: "תאריך", render: (item: any) => new Date(item.income_date).toLocaleDateString("he-IL") },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "category", header: "קטגוריה" },
  { key: "payment_method", header: "אופן ביצוע", render: (item: any) => <Badge variant="outline" className="font-medium">{item.payment_method || "ללא"}</Badge> },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

const expenseColumns = [
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "expense_date", header: "תאריך", render: (item: any) => new Date(item.expense_date).toLocaleDateString("he-IL") },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "category", header: "קטגוריה" },
  { key: "payment_method", header: "אופן ביצוע", render: (item: any) => <Badge variant="outline" className="font-medium">{item.payment_method || "ללא"}</Badge> },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

const incomeBulkFields: BulkField[] = [
  { key: "type", label: "סוג", type: "select", options: ["חודשי", "חד פעמי"] },
  { key: "category", label: "קטגוריה", type: "text" },
  { key: "payment_method", label: "אופן ביצוע", type: "select", options: ["אשראי", "מזומן", "בנקאי", "אחר", "ללא"] },
  { key: "status", label: "סטטוס", type: "select", options: ["מאושר", "לאישור", "צפוי"] },
];

const expenseBulkFields: BulkField[] = [
  { key: "type", label: "סוג", type: "select", options: ["חודשי", "חד פעמי"] },
  { key: "category", label: "קטגוריה", type: "text" },
  { key: "payment_method", label: "אופן ביצוע", type: "select", options: ["אשראי", "מזומן", "בנקאי", "אחר", "ללא"] },
  { key: "status", label: "סטטוס", type: "select", options: ["מאושר", "לאישור", "צפוי"] },
];

export default function CashFlow() {
  const { toast } = useToast();
  const { data: incomeData, insert: insertIncome, update: updateIncome, bulkUpdate: bulkUpdateIncome, bulkRemove: bulkRemoveIncome } = useSupabaseTable("income", { userScoped: true });
  const { data: expenseData, insert: insertExpense, update: updateExpense, bulkUpdate: bulkUpdateExpense, bulkRemove: bulkRemoveExpense } = useSupabaseTable("expenses", { userScoped: true });

  const [activeTab, setActiveTab] = useState("income");

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editIncomeItem, setEditIncomeItem] = useState<any>(null);
  const [editExpenseItem, setEditExpenseItem] = useState<any>(null);

  const [incomeBulkOpen, setIncomeBulkOpen] = useState(false);
  const [expenseBulkOpen, setExpenseBulkOpen] = useState(false);
  const [incomeBulkIds, setIncomeBulkIds] = useState<string[]>([]);
  const [expenseBulkIds, setExpenseBulkIds] = useState<string[]>([]);

  const incomeTotal = incomeData.filter((i: any) => i.status === "מאושר").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const incomeExpected = incomeData.filter((i: any) => i.status === "צפוי").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const incomePending = incomeData.filter((i: any) => i.status === "לאישור").length;

  const expenseTotal = expenseData.filter((i: any) => i.status === "מאושר").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const expenseExpected = expenseData.filter((i: any) => i.status === "צפוי").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const expensePending = expenseData.filter((i: any) => i.status === "לאישור").length;

  const balance = incomeTotal - expenseTotal;

  const handleAddIncome = () => { setEditIncomeItem(null); setIncomeDialogOpen(true); };
  const handleAddExpense = () => { setEditExpenseItem(null); setExpenseDialogOpen(true); };
  const handleEditIncome = (item: any) => { setEditIncomeItem(item); setIncomeDialogOpen(true); };
  const handleEditExpense = (item: any) => { setEditExpenseItem(item); setExpenseDialogOpen(true); };

  const handleSaveIncome = async (formData: IncomeFormData, id?: string) => {
    if (id) { await updateIncome({ id, ...formData }); toast({ title: "ההכנסה עודכנה" }); }
    else { await insertIncome(formData); toast({ title: "הכנסה חדשה נוספה" }); }
  };
  const handleSaveExpense = async (formData: ExpenseFormData, id?: string) => {
    if (id) { await updateExpense({ id, ...formData }); toast({ title: "ההוצאה עודכנה" }); }
    else { await insertExpense(formData); toast({ title: "הוצאה חדשה נוספה" }); }
  };

  const handleIncomeBulkEdit = (ids: string[]) => { setIncomeBulkIds(ids); setIncomeBulkOpen(true); };
  const handleExpenseBulkEdit = (ids: string[]) => { setExpenseBulkIds(ids); setExpenseBulkOpen(true); };

  const handleIncomeBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdateIncome({ ids: incomeBulkIds, updates });
    toast({ title: `${incomeBulkIds.length} רשומות עודכנו` });
  };
  const handleExpenseBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdateExpense({ ids: expenseBulkIds, updates });
    toast({ title: `${expenseBulkIds.length} רשומות עודכנו` });
  };

  const handleIncomeBulkDelete = async (ids: string[]) => {
    await bulkRemoveIncome(ids);
    toast({ title: `${ids.length} רשומות נמחקו` });
  };
  const handleExpenseBulkDelete = async (ids: string[]) => {
    await bulkRemoveExpense(ids);
    toast({ title: `${ids.length} רשומות נמחקו` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">עובר ושב</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר ההכנסות וההוצאות שלך</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="הכנסות מאושרות" value={`₪${incomeTotal.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-success/10 text-success" />
        <StatCard title="הוצאות מאושרות" value={`₪${expenseTotal.toLocaleString()}`} icon={TrendingDown} iconClassName="bg-destructive/10 text-destructive" />
        <StatCard title="יתרה" value={`₪${balance.toLocaleString()}`} icon={Scale} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לאישור" value={incomePending + expensePending} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="rounded-xl bg-muted/80 p-1 h-11">
          <TabsTrigger value="income" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-success font-bold">
            <TrendingUp className="h-4 w-4" />
            הכנסות
            {incomeData.length > 0 && (
              <span className="mr-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{incomeData.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-destructive font-bold">
            <TrendingDown className="h-4 w-4" />
            הוצאות
            {expenseData.length > 0 && (
              <span className="mr-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{expenseData.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="הכנסות מאושרות" value={`₪${incomeTotal.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-success/10 text-success" />
            <StatCard title="הכנסות צפויות" value={`₪${incomeExpected.toLocaleString()}`} icon={Calendar} iconClassName="bg-primary/10 text-primary" />
            <StatCard title="לאישור" value={incomePending} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
          </div>
          <DataTable
            data={incomeData}
            columns={incomeColumns}
            title="הכנסות"
            addLabel="הכנסה חדשה"
            onAdd={handleAddIncome}
            onExport={() => toast({ title: "ייצוא" })}
            onRowClick={handleEditIncome}
            onBulkEdit={handleIncomeBulkEdit}
            onBulkDelete={handleIncomeBulkDelete}
            filters={[{ key: "type", label: "סוג" }, { key: "category", label: "קטגוריה" }, { key: "payment_method", label: "אופן ביצוע" }, { key: "status", label: "סטטוס" }]}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="הוצאות מאושרות" value={`₪${expenseTotal.toLocaleString()}`} icon={TrendingDown} iconClassName="bg-destructive/10 text-destructive" />
            <StatCard title="הוצאות צפויות" value={`₪${expenseExpected.toLocaleString()}`} icon={Calendar} iconClassName="bg-primary/10 text-primary" />
            <StatCard title="לאישור" value={expensePending} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
          </div>
          <DataTable
            data={expenseData}
            columns={expenseColumns}
            title="הוצאות"
            addLabel="הוצאה חדשה"
            onAdd={handleAddExpense}
            onExport={() => toast({ title: "ייצוא" })}
            onRowClick={handleEditExpense}
            onBulkEdit={handleExpenseBulkEdit}
            onBulkDelete={handleExpenseBulkDelete}
            filters={[{ key: "type", label: "סוג" }, { key: "category", label: "קטגוריה" }, { key: "payment_method", label: "אופן ביצוע" }, { key: "status", label: "סטטוס" }]}
          />
        </TabsContent>
      </Tabs>

      <IncomeFormDialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} initialData={editIncomeItem} onSave={handleSaveIncome} />
      <ExpenseFormDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} initialData={editExpenseItem} onSave={handleSaveExpense} />
      <BulkEditDialog open={incomeBulkOpen} onOpenChange={setIncomeBulkOpen} fields={incomeBulkFields} count={incomeBulkIds.length} onSave={handleIncomeBulkSave} />
      <BulkEditDialog open={expenseBulkOpen} onOpenChange={setExpenseBulkOpen} fields={expenseBulkFields} count={expenseBulkIds.length} onSave={handleExpenseBulkSave} />
    </div>
  );
}
