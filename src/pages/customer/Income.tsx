import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { IncomeFormDialog, IncomeFormData } from "@/components/customer/IncomeFormDialog";

const statusMap: Record<string, string> = {
  "מאושר": "bg-success/10 text-success border-success/20",
  "לאישור": "bg-chart-3/10 text-chart-3 border-chart-3/20",
  "צפוי": "bg-primary/10 text-primary border-primary/20",
};

const columns = [
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "income_date", header: "תאריך", render: (item: any) => new Date(item.income_date).toLocaleDateString("he-IL") },
  { key: "type", header: "סוג", render: (item: any) => <Badge variant="outline" className="font-medium">{item.type}</Badge> },
  { key: "category", header: "קטגוריה" },
  { key: "status", header: "סטטוס", render: (item: any) => <Badge variant="outline" className={`font-medium ${statusMap[item.status] || ""}`}>{item.status}</Badge> },
];

export default function CustomerIncome() {
  const { toast } = useToast();
  const { data, insert, update } = useSupabaseTable("income", { userScoped: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const total = data.filter((i: any) => i.status === "מאושר").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const expected = data.filter((i: any) => i.status === "צפוי").reduce((sum, i: any) => sum + Number(i.amount || 0), 0);
  const pending = data.filter((i: any) => i.status === "לאישור").length;

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: IncomeFormData, id?: string) => {
    if (id) {
      await update({ id, ...formData });
      toast({ title: "ההכנסה עודכנה" });
    } else {
      await insert(formData);
      toast({ title: "הכנסה חדשה נוספה" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הכנסות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר ההכנסות שלך</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="הכנסות מאושרות" value={`₪${total.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-success/10 text-success" />
        <StatCard title="הכנסות צפויות" value={`₪${expected.toLocaleString()}`} icon={Calendar} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="לאישור" value={pending} icon={CheckCircle} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>
      <DataTable data={data} columns={columns} title="הכנסות" addLabel="הכנסה חדשה" onAdd={handleAdd} onExport={() => toast({ title: "ייצוא" })} onRowClick={handleEdit} />
      <IncomeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
