import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/hooks/use-toast";

const mockPartners = [
  { name: "ראובן גולד", phone: "050-1111111", email: "rg@example.com", commission: "5% + ₪500/חודש", marketers: 8, status: "פעיל" },
  { name: "שמעון כסף", phone: "052-2222222", email: "sk@example.com", commission: "3%", marketers: 5, status: "פעיל" },
  { name: "לוי ברונזה", phone: "054-3333333", email: "lb@example.com", commission: "₪1,000/חודש", marketers: 3, status: "לא פעיל" },
];

const columns = [
  { key: "name", header: "שם שותף" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "commission", header: "תנאי עמלה" },
  { key: "marketers", header: "מס׳ משווקים" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function AdminPartners() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול שותפים</h1>
        <p className="text-muted-foreground">שותפים אחראי משווקים</p>
      </div>
      <DataTable
        data={mockPartners}
        columns={columns}
        title="שותפים"
        addLabel="שותף חדש"
        onAdd={() => toast({ title: "הוספת שותף", description: "טופס הוספת שותף ייפתח בקרוב" })}
      />
    </div>
  );
}
