import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadFormDialog, LeadFormData } from "@/components/admin/LeadFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

export default function AdminLeads() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove, refetch } = useSupabaseTable("leads");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [convertIds, setConvertIds] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);

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

  const doConvert = async () => {
    setConverting(true);
    try {
      const leadsToConvert = data.filter((l: any) => convertIds.includes(l.id));
      const customers = leadsToConvert.map((l: any) => ({
        name: l.name,
        phone: l.phone,
        email: l.email,
        community: l.community,
        marketer_name: l.marketer_name,
        marketer_id: l.marketer_id,
        subscription: "פעיל",
        created_by: user?.id,
      }));
      const { error: insErr } = await supabase.from("customers").insert(customers);
      if (insErr) throw insErr;
      const { error: delErr } = await supabase.from("leads").delete().in("id", convertIds);
      if (delErr) throw delErr;
      await refetch();
      toast({ title: `${convertIds.length} לידים הומרו ללקוחות בהצלחה` });
      setConvertIds([]);
    } catch (e: any) {
      toast({ title: "שגיאה בהמרה", description: e.message, variant: "destructive" });
    } finally {
      setConverting(false);
    }
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
        extraBulkActions={[
          { label: "המר ללקוחות", icon: UserCheck, onClick: (ids) => setConvertIds(ids) },
        ]}
        extraRowActions={[
          { label: "המר ללקוח", icon: UserCheck, onClick: (item) => setConvertIds([item.id]) },
        ]}
      />
      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog open={bulkOpen} onOpenChange={setBulkOpen} fields={bulkFields} count={bulkIds.length} onSave={handleBulkSave} />

      <AlertDialog open={convertIds.length > 0} onOpenChange={(o) => !o && !converting && setConvertIds([])}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>המרה ללקוחות</AlertDialogTitle>
            <AlertDialogDescription>
              <b className="text-primary">{convertIds.length}</b> לידים יועברו לטבלת הלקוחות (סטטוס מנוי: פעיל) ויימחקו מטבלת הלידים. האם להמשיך?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={converting} className="rounded-xl">ביטול</AlertDialogCancel>
            <AlertDialogAction
              disabled={converting}
              className="rounded-xl gradient-primary border-0"
              onClick={(e) => { e.preventDefault(); doConvert(); }}
            >
              {converting ? "מעביר..." : "המר ללקוחות"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
