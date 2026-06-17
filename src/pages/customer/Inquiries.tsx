import { useState, useMemo } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatHebrewDate } from "@/lib/hebrewDate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, MailOpen, MailCheck, Inbox, Paperclip } from "lucide-react";

interface Inquiry {
  id: string;
  subject: string;
  description: string | null;
  status: string;
  attachment_url: string | null;
  created_at: string;
}

const OPEN = "פתוח";
const CLOSED = "סגור";

export default function CustomerInquiries() {
  const { data, insert, update, remove, isInserting } = useSupabaseTable<Inquiry>("inquiries", { userScoped: true });
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const stats = useMemo(() => {
    const open = data.filter((i) => i.status === OPEN).length;
    const closed = data.filter((i) => i.status === CLOSED).length;
    return { open, closed, total: data.length };
  }, [data]);

  const resetForm = () => {
    setSubject("");
    setDescription("");
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      toast({ title: "שגיאה", description: "יש להזין נושא", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      let attachment_url: string | null = null;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("משתמש לא מחובר");
        const path = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);
        attachment_url = pub.publicUrl;
      }
      await insert({
        subject: subject.trim(),
        description: description.trim() || null,
        status: OPEN,
        attachment_url,
      } as Partial<Inquiry>);
      toast({ title: "הפנייה נשלחה", description: "פנייתך נקלטה בהצלחה" });
      resetForm();
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = async (item: Inquiry) => {
    await update({ id: item.id, status: item.status === OPEN ? CLOSED : OPEN } as any);
  };

  const columns = [
    {
      key: "subject",
      header: "נושא",
      render: (item: Inquiry) => <span className="font-semibold text-foreground">{item.subject}</span>,
    },
    {
      key: "description",
      header: "תיאור",
      render: (item: Inquiry) => (
        <span className="text-muted-foreground line-clamp-2 max-w-xs block">{item.description || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "סטטוס",
      render: (item: Inquiry) => (
        <Badge
          className={
            item.status === OPEN
              ? "bg-success/10 text-success hover:bg-success/10 border-0 rounded-lg"
              : "bg-muted text-muted-foreground hover:bg-muted border-0 rounded-lg"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "תאריך",
      render: (item: Inquiry) => (
        <span className="text-sm text-muted-foreground">{formatHebrewDate(item.created_at)}</span>
      ),
    },
    {
      key: "attachment_url",
      header: "קובץ",
      render: (item: Inquiry) =>
        item.attachment_url ? (
          <a
            href={item.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <Paperclip className="h-3.5 w-3.5" /> קובץ מצורף
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold gradient-text">צור קשר / פניות</h1>
        <p className="text-muted-foreground mt-1">שלחו פנייה וצרו קשר עם הצוות</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="פניות פתוחות" value={stats.open} icon={MailOpen} iconClassName="bg-success/10 text-success" delay={0} />
        <StatCard title="פניות סגורות" value={stats.closed} icon={MailCheck} iconClassName="bg-muted text-muted-foreground" delay={50} />
        <StatCard title='סה"כ פניות' value={stats.total} icon={Inbox} iconClassName="bg-primary/10 text-primary" delay={100} />
      </div>

      <DataTable<Inquiry>
        data={data}
        columns={columns}
        title="הפניות שלי"
        addLabel="פנייה חדשה"
        onAdd={() => { resetForm(); setDialogOpen(true); }}
        searchPlaceholder="חיפוש פניות..."
        filters={[{ key: "status", label: "סטטוס", options: [OPEN, CLOSED] }]}
        onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => remove(id))); }}
        extraRowActions={[
          {
            label: "שינוי סטטוס",
            icon: MessageSquare,
            onClick: (item: Inquiry) => toggleStatus(item),
          },
        ]}
        onRowClick={(item: Inquiry) => toggleStatus(item)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>פנייה חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                נושא <span className="text-destructive">*</span>
              </Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="נושא הפנייה"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">תיאור</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="פרטו את פנייתכם..."
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">קובץ מצורף</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="rounded-xl cursor-pointer file:ml-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary file:font-medium"
              />
              {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 shadow-glow-sm"
              onClick={handleSubmit}
              disabled={uploading || isInserting}
            >
              {uploading || isInserting ? "שולח..." : "שליחת פנייה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
