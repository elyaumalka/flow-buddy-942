import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { Heart, TrendingUp, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockTithes = [
  { amount: "₪500", date: "05/03/2026", recipient: "בית כנסת שלום", notes: "" },
  { amount: "₪300", date: "12/03/2026", recipient: "עמותת חסד", notes: "תרומה חודשית" },
  { amount: "₪200", date: "20/02/2026", recipient: "קרן צדקה", notes: "" },
  { amount: "₪500", date: "05/02/2026", recipient: "בית כנסת שלום", notes: "" },
  { amount: "₪1,000", date: "01/01/2026", recipient: "מוסד חינוכי", notes: "תרומה שנתית" },
];

const columns = [
  { key: "amount", header: "סכום" },
  { key: "date", header: "תאריך" },
  { key: "recipient", header: "למי ניתן" },
  { key: "notes", header: "הערות" },
];

export default function CustomerTithes() {
  const { toast } = useToast();

  // Mock calculation: 10% of income
  const totalIncome = 22700;
  const expectedTithe = Math.round(totalIncome * 0.1);
  const paidTithe = 800;
  const remaining = expectedTithe - paidTithe;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">מעשרות</h1>
        <p className="text-muted-foreground">ניהול ומעקב אחר מעשרות וצדקה</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="מעשר חודשי צפוי" value={`₪${expectedTithe.toLocaleString()}`} icon={Calculator} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="שולם החודש" value={`₪${paidTithe.toLocaleString()}`} icon={Heart} iconClassName="bg-success/10 text-success" />
        <StatCard title="נותר לתשלום" value={`₪${remaining.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-chart-3/10 text-chart-3" />
      </div>

      <DataTable
        data={mockTithes}
        columns={columns}
        title="מעשרות וצדקה"
        addLabel="תרומה חדשה"
        onAdd={() => toast({ title: "הוספת תרומה חדשה" })}
        onExport={() => toast({ title: "ייצוא" })}
      />
    </div>
  );
}
