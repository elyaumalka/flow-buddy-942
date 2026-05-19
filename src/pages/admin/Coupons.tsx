import { useState } from "react";
import { format } from "date-fns";
import { DataTable, FilterDef } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CouponFormDialog, CouponFormData } from "@/components/admin/CouponFormDialog";
import { BulkEditDialog, BulkField } from "@/components/admin/BulkEditDialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const columns = [
  { key: "name", header: "שם" },
  { key: "code", header: "קוד", render: (i: any) => <span className="font-mono font-bold tracking-wider" dir="ltr">{i.code}</span> },
  { key: "price", header: "מחיר", render: (i: any) => `₪${Number(i.price).toLocaleString()}` },
  {
    key: "expires_at",
    header: "תפוגה",
    render: (i: any) => {
      if (!i.expires_at) return <Badge variant="secondary" className="rounded-lg">ללא הגבלה</Badge>;
      const d = new Date(i.expires_at);
      const expired = d < new Date();
      return <span className={expired ? "text-destructive font-semibold" : ""}>{format(d, "dd/MM/yyyy")}</span>;
    },
  },
  { key: "status", header: "סטטוס", render: (i: any) => <StatusBadge status={i.status} /> },
];

const bulkFields: BulkField[] = [
  { key: "status", label: "סטטוס", type: "select", options: ["פעיל", "לא פעיל"] },
  { key: "price", label: "מחיר", type: "number" },
];

const filters: FilterDef[] = [
  { key: "status", label: "סטטוס", options: ["פעיל", "לא פעיל"] },
];

export default function AdminCoupons() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, insert, update, bulkUpdate, bulkRemove } = useSupabaseTable("coupons");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleSave = async (form: CouponFormData, id?: string) => {
    if (id) { await update({ id, ...form } as any); toast({ title: "הקופון עודכן" }); }
    else { await insert({ ...form, created_by: user?.id } as any); toast({ title: "קופון חדש נוסף" }); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ניהול קופונים</h1>
        <p className="text-muted-foreground">הגדרת קופונים, מחירים ותאריכי תפוגה</p>
      </div>
      <DataTable
        data={data}
        columns={columns}
        title="קופונים"
        addLabel="קופון חדש"
        onAdd={() => { setEditItem(null); setDialogOpen(true); }}
        onRowClick={(item) => { setEditItem(item); setDialogOpen(true); }}
        onBulkEdit={(ids) => { setBulkIds(ids); setBulkOpen(true); }}
        onBulkDelete={async (ids) => { await bulkRemove(ids); toast({ title: `${ids.length} קופונים נמחקו` }); }}
        filters={filters}
      />
      <CouponFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
      <BulkEditDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        fields={bulkFields}
        count={bulkIds.length}
        onSave={async (updates) => { await bulkUpdate({ ids: bulkIds, updates: updates as any }); toast({ title: `${bulkIds.length} קופונים עודכנו` }); }}
      />
    </div>
  );
}
