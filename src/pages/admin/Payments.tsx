import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockPayments = [
  { customer: "יוסי כהן", date: "01/03/2026", amount: "₪149", invoice: "INV-0042", status: "שולם" },
  { customer: "רחל לוי", date: "01/03/2026", amount: "₪199", invoice: "INV-0043", status: "שולם" },
  { customer: "דוד אברהם", date: "01/03/2026", amount: "₪149", invoice: "INV-0044", status: "נכשל" },
  { customer: "שרה מזרחי", date: "01/03/2026", amount: "₪99", invoice: "INV-0045", status: "שולם" },
];

export default function AdminPayments() {
  const { toast } = useToast();

  const columns = [
    { key: "customer", header: "שם לקוח" },
    { key: "date", header: "תאריך חיוב" },
    { key: "amount", header: "סכום" },
    { key: "invoice", header: "חשבונית" },
    { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
    {
      key: "actions", header: "פעולות", render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "הורדת חשבונית" })}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: "חשבונית נשלחה למייל" })}>
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">תשלומי מנויים</h1>
        <p className="text-muted-foreground">ניהול תשלומי מנויים וחשבוניות</p>
      </div>
      <DataTable data={mockPayments} columns={columns} title="תשלומים" onExport={() => toast({ title: "ייצוא" })} />
    </div>
  );
}
