import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadFormDialog, LeadFormData } from "@/components/admin/LeadFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import type { FilterDef } from "@/components/admin/DataTable";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserCheck } from "lucide-react";

const columns = [
  { key: "name", header: "שם" },
  { key: "phone", header: "טלפון" },
  { key: "email", header: "מייל" },
  { key: "city", header: "כתובת" },
  { key: "community", header: "קהילה" },
  { key: "status", header: "סטטוס", render: (item: any) => <StatusBadge status={item.status} /> },
  { key: "source", header: "מקור הגעה" },
  { key: "marketer_name", header: "משווק מקושר" },
  { key: "created_at", header: "תאריך", render: (item: any) => new Date(item.created_at).toLocaleDateString("he-IL") },
];

const bulkFields: BulkField[] = [
  { key: "city", label: "כתובת", type: "text" },
  { key: "community", label: "קהילה", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["חדש", "בטיפול", "ממתין", "הושלם"] },
  { key: "source", label: "מקור הגעה", type: "select", options: ["אתר", "טלפון", "הפניה", "פייסבוק"] },
  { key: "marketer_name", label: "משווק מקושר", type: "text" },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["חדש", "בטיפול", "ממתין", "הושלם"] },
  { key: "source", label: "מקור הגעה" },
  { key: "community", label: "קהילה" },
  { key: "marketer_name", label: "משווק מקושר" },
];

export default function AdminLeads() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("leads");
  const { insert: insertCustomer } = useSupabaseTable("customers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: LeadFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "הליד עודכן בהצלחה" }); }
    else { await insert({ ...formData, created_by: user?.id }); toast({ title: "ליד חדש נוסף בהצלחה" }); }
  };
  const handleBulkEdit = (ids: string[]) => { setBulkIds(ids); setBulkOpen(true); };
  const handleBulkSave = async (updates: Record<string, any>) => {
    await bulkUpdate({ ids: bulkIds, updates });
    toast({ title: `${bulkIds.length} לידים עודכנו` });
  };
  const handleBulkDelete = async (ids: string[]) => {
    await bulkRemove(ids);
    toast({ title: `${ids.length} לידים נמחקו` });
  };

  const handleConvert = async (lead: any) => {
    await insertCustomer({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      community: lead.community,
      marketer_id: lead.marketer_id,
      marketer_name: lead.marketer_name,
      created_by: user?.id,
    });
    await update({ id: lead.id, status: "הומר ללקוח" });
    toast({ title: "הליד הומר ללקוח" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול לידים</h1>
        <p className="text-muted-foreground">ניהול וטיפול בלידים שמגיעים למערכת</p>
      </div>
      <DataTable
        data={data}
        columns={columns}
        title="לידים"
        addLabel="ליד חדש"
        onAdd={handleAdd}
        onExport={() => toast({ title: "ייצוא" })}
        searchPlaceholder="חיפוש לפי שם, טלפון, מייל..."
        onRowClick={handleEdit}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        filters={filters}
        extraRowActions={[
          { label: "המר ללקוח", icon: UserCheck, onClick: (item) => handleConvert(item) },
        ]}
      />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />
    </div>
  );
}
