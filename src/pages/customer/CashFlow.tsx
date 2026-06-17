import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { TrendingUp, TrendingDown, Scale, Calendar, CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { IncomeFormDialog, IncomeFormData } from "@/components/customer/IncomeFormDialog";
import { ExpenseFormDialog, ExpenseFormData } from "@/components/customer/ExpenseFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { formatCurrency } from "@/lib/format";
import { formatHebrewDate } from "@/lib/hebrewDate";
import { ENTRY_TYPES, ENTRY_STATUSES, PAYMENT_METHODS } from "@/lib/financeConstants";

const statusMap: Record<string, string> = {
  "מאושר": "bg-success/10 text-success border-success/20",
  "לאישור": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "צפוי": "bg-primary/10 text-primary border-primary/20",
};

const dateCell = (value: string) => (
  <div className="flex flex-col">
    <span>{new Date(value).toLocaleDateString("he-IL")}</span>
    <span className="text-[11px] text-muted-foreground">{formatHebrewDate(value)}</span>
  </div>
);

const incomeColumns = [
  { key: "income_date", header: "תאריך", render: (item: any) => dateCell(item.income_date) },
  { key: "amount", header: "סכום", render: (item: any) => formatCurrency(item.amount) },
  { key: "category", header: "קטגוריה" },
  { key: "description", header: "תיאור", render: (item: any) => item.description || "" },
  { key: "payment_method", header: "אופן ביצוע", render: (item: any) => <Badge variant="outline" className="font-medium">{item.payment_method || "ללא"}</Badge> },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

const expenseColumns = [
  { key: "expense_date", header: "תאריך", render: (item: any) => dateCell(item.expense_date) },
  { key: "amount", header: "סכום", render: (item: any) => formatCurrency(item.amount) },
  { key: "category", header: "קטגוריה" },
  { key: "description", header: "תיאור", render: (item: any) => item.description || "" },
  { key: "payment_method", header: "אופן ביצוע", render: (item: any) => <Badge variant="outline" className="font-medium">{item.payment_method || "ללא"}</Badge> },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

const incomeBulkFields: BulkField[] = [
  { key: "type", label: "סוג", type: "select", options: [...ENTRY_TYPES] },
  { key: "category", label: "קטגוריה", type: "text" },
  { key: "description", label: "תיאור", type: "text" },
  { key: "payment_method", label: "אופן ביצוע", type: "select", options: [...PAYMENT_METHODS] },
  { key: "status", label: "סטטוס", type: "select", options: [...ENTRY_STATUSES] },
];

const expenseBulkFields: BulkField[] = [
  { key: "type", label: "סוג", type: "select", options: [...ENTRY_TYPES] },
  { key: "category", label: "קטגוריה", type: "text" },
  { key: "description", label: "תיאור", type: "text" },
  { key: "payment_method", label: "אופן ביצוע", type: "select", options: [...PAYMENT_METHODS] },
  { key: "status", label: "סטטוס", type: "select", options: [...ENTRY_STATUSES] },
];

const currentMonth = () => new Date().toISOString().slice(0, 7);
const inMonth = (dateStr: string, month: string) => !month || (dateStr && String(dateStr).slice(0, 7) === month);

function exportRows(rows: any[], dateKey: string, fileName: string) {
  const aoa = rows.map((r) => ({
    "תאריך": r[dateKey] ? new Date(r[dateKey]).toLocaleDateString("he-IL") : "",
    "תאריך עברי": formatHebrewDate(r[dateKey]),
    "סכום": Number(r.amount || 0),
    "קטגוריה": r.category || "",
    "תיאור": r.description || "",
    "אופן ביצוע": r.payment_method || "",
    "סוג": r.type || "",
    "סטטוס": r.status || "",
  }));
  const ws = XLSX.utils.json_to_sheet(aoa, { header: ["תאריך", "תאריך עברי", "סכום", "קטגוריה", "תיאור", "אופן ביצוע", "סוג", "סטטוס"] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
}

interface MonthFilterProps { value: string; onChange: (v: string) => void; }
function MonthFilter({ value, onChange }: MonthFilterProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">חודש</Label>
        <Input type="month" value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl w-44" dir="ltr" />
      </div>
      {value && (
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onChange("")}>
          <X className="h-3.5 w-3.5 ml-1" /> כל החודשים
        </Button>
      )}
    </div>
  );
}

export default function CashFlow() {
  const { toast } = useToast();
  const { data: incomeData, insert: insertIncome, update: updateIncome, bulkUpdate: bulkUpdateIncome, bulkRemove: bulkRemoveIncome } = useSupabaseTable("income", { userScoped: true });
  const { data: expenseData, insert: insertExpense, update: updateExpense, bulkUpdate: bulkUpdateExpense, bulkRemove: bulkRemoveExpense } = useSupabaseTable("expenses", { userScoped: true });

  const [activeTab, setActiveTab] = useState("income");

  const [incomeMonth, setIncomeMonth] = useState(currentMonth());
  const [expenseMonth, setExpenseMonth] = useState(currentMonth());

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editIncomeItem, setEditIncomeItem] = useState<any>(null);
  const [editExpenseItem, setEditExpenseItem] = useState<any>(null);

  const [incomeBulkOpen, setIncomeBulkOpen] = useState(false);
  const [expenseBulkOpen, setExpenseBulkOpen] = useState(false);
  const [incomeBulkIds, setIncomeBulkIds] = useState<string[]>([]);
  const [expenseBulkIds, setExpenseBulkIds] = useState<string[]>([]);

  const filteredIncome = useMemo(() => incomeData.filter((i: any) => inMonth(i.income_date, incomeMonth)), [incomeData, incomeMonth]);
  const filteredExpense = useMemo(() => expenseData.filter((i: any) => inMonth(i.expense_date, expenseMonth)), [expenseData, expenseMonth]);

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

  const handleExportIncome = () => { exportRows(filteredIncome, "income_date", "הכנסות.xlsx"); toast({ title: "הקובץ יוצא" }); };
  const handleExportExpense = () => { exportRows(filteredExpense, "expense_date", "הוצאות.xlsx"); toast({ title: "הקובץ יוצא" }); };

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
          <MonthFilter value={incomeMonth} onChange={setIncomeMonth} />
          <DataTable
            data={filteredIncome}
            columns={incomeColumns}
            title="הכנסות"
            addLabel="הכנסה חדשה"
            onAdd={handleAddIncome}
            onExport={handleExportIncome}
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
          <MonthFilter value={expenseMonth} onChange={setExpenseMonth} />
          <DataTable
            data={filteredExpense}
            columns={expenseColumns}
            title="הוצאות"
            addLabel="הוצאה חדשה"
            onAdd={handleAddExpense}
            onExport={handleExportExpense}
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
