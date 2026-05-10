import { DataTable, type FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";

const filters: FilterDef[] = [
  { key: "subscription", label: "סטטוס", options: ["פעיל", "לא פעיל", "מושהה"] },
  { key: "community", label: "קהילה" },
];

const columns = [
  { key: "name", header: "שם הלקוח" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "join_date", header: "תאריך הצטרפות", render: (item: any) => new Date(item.join_date).toLocaleDateString("he-IL") },
  { key: "subscription", header: "סטטוס", render: (item: any) => <StatusBadge status={item.subscription} /> },
];

export default function MarketerCustomers() {
  const { data } = useSupabaseTable("customers");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הלקוחות שלי</h1>
        <p className="text-muted-foreground">לקוחות שהגיעו דרכך</p>
      </div>
      <DataTable data={data} columns={columns} title="לקוחות" filters={filters} />
    </div>
  );
}
