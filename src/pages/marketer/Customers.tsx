import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";

const mockCustomers = [
  { name: "יוסי כהן", phone: "050-1112233", email: "yossi@example.com", joinDate: "01/01/2026", status: "פעיל" },
  { name: "רחל לוי", phone: "052-4445566", email: "rachel@example.com", joinDate: "15/02/2026", status: "פעיל" },
  { name: "דוד אברהם", phone: "054-7778899", email: "david@example.com", joinDate: "20/11/2025", status: "לא פעיל" },
  { name: "שרה מזרחי", phone: "053-9990011", email: "sara@example.com", joinDate: "05/03/2026", status: "פעיל" },
];

const columns = [
  { key: "name", header: "שם הלקוח" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "joinDate", header: "תאריך הצטרפות" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
];

export default function MarketerCustomers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הלקוחות שלי</h1>
        <p className="text-muted-foreground">לקוחות שהגיעו דרכך</p>
      </div>
      <DataTable data={mockCustomers} columns={columns} title="לקוחות" />
    </div>
  );
}
