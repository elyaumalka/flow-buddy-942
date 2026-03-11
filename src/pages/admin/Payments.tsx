import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";

const columns = [
  { key: "customer_name", header: "שם לקוח" },
  { key: "payment_date", header: "תאריך חיוב", render: (item: any) => new Date(item.payment_date).toLocaleDateString("he-IL") },
  { key: "amount", header: "סכום", render: (item: any) => `₪${Number(item.amount).toLocaleString()}` },
  { key: "invoice", header: "חשבונית" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminPayments() {
  const { toast } = useToast();
  const { data } = useSupabaseTable("payments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">תשלומי מנויים</h1>
        <p className="text-muted-foreground">ניהול תשלומי מנויים וחשבוניות</p>
      </div>
      <DataTable data={data} columns={columns} title="תשלומים" onExport={() => toast({ title: "ייצוא" })} />
    </div>
  );
}
