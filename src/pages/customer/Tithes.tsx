import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/admin/StatCard";
import { Heart, TrendingUp, Calculator, Coins, Wallet, Plus } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { TitheFormDialog, TitheFormData } from "@/components/customer/TitheFormDialog";
import { TITHE_RATES } from "@/lib/financeConstants";
import { formatCurrency } from "@/lib/format";
import { formatHebrewDate } from "@/lib/hebrewDate";

export default function CustomerTithes() {
  const { toast } = useToast();
  const { data: tithes, insert, update } = useSupabaseTable("tithes", { userScoped: true });
  const { data: incomeData } = useSupabaseTable("income", { userScoped: true });
  const { data: expenseData } = useSupabaseTable("expenses", { userScoped: true });
  const { active } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [rate, setRate] = useState<number>(10);

  // Lookup maps for category tithe attributes.
  const incomeLiable = useMemo(() => {
    const map = new Map<string, boolean>();
    active.filter((c) => c.kind === "income").forEach((c) => map.set(c.name, c.tithe_liable !== false));
    return map;
  }, [active]);

  const expenseOffset = useMemo(() => {
    const map = new Map<string, boolean>();
    active.filter((c) => c.kind === "expense").forEach((c) => map.set(c.name, c.tithe_offset === true));
    return map;
  }, [active]);

  // Income liable for tithe: approved income whose category is tithe-liable
  // (default to liable if category isn't found).
  const liableIncome = useMemo(() =>
    incomeData
      .filter((i: any) => i.status === "מאושר")
      .filter((i: any) => incomeLiable.get(i.category) !== false)
      .reduce((sum, i: any) => sum + Number(i.amount || 0), 0),
    [incomeData, incomeLiable]);

  // Charity offsets: expenses whose category has tithe_offset === true.
  const offsets = useMemo(() =>
    expenseData
      .filter((e: any) => expenseOffset.get(e.category) === true)
      .reduce((sum, e: any) => sum + Number(e.amount || 0), 0),
    [expenseData, expenseOffset]);

  const required = liableIncome * (rate / 100);
  const netRequired = Math.max(required - offsets, 0);
  const given = tithes.reduce((sum, t: any) => sum + Number(t.amount || 0), 0);
  const balance = Math.max(netRequired - given, 0);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };
  const handleSave = async (formData: TitheFormData, id?: string) => {
    if (id) { await update({ id, ...formData }); toast({ title: "התרומה עודכנה" }); }
    else { await insert(formData); toast({ title: "תרומה חדשה נוספה" }); }
  };

  const sortedTithes = [...tithes].sort((a: any, b: any) =>
    new Date(b.tithe_date).getTime() - new Date(a.tithe_date).getTime());

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">מאזן מעשר</h1>
          <p className="text-muted-foreground">חישוב המעשר הנדרש ומעקב אחר תשלומים</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(rate)} onValueChange={(v) => setRate(Number(v))}>
            <SelectTrigger className="rounded-xl w-40"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {TITHE_RATES.map((r) => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow gap-1.5">
            <Plus className="h-4 w-4" />
            רישום תרומה/מעשר
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="הכנסה חייבת" value={formatCurrency(liableIncome)} icon={TrendingUp} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="מעשר נדרש" value={formatCurrency(required)} icon={Calculator} iconClassName="bg-chart-2/10 text-chart-2" delay={50} />
        <StatCard title="קיזוז צדקה" value={formatCurrency(offsets)} icon={Coins} iconClassName="bg-chart-4/10 text-chart-4" delay={100} />
        <StatCard title="שולם" value={formatCurrency(given)} icon={Heart} iconClassName="bg-success/10 text-success" delay={150} />
        <StatCard title="יתרה לתשלום" value={formatCurrency(balance)} icon={Wallet} iconClassName="bg-chart-3/10 text-chart-3" delay={200} />
      </div>

      <Card className="animate-fade-in">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="font-bold text-foreground">תרומות ומעשרות שנרשמו</h2>
          </div>
          {sortedTithes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>טרם נרשמו תרומות. לחץ על "רישום תרומה/מעשר" כדי להתחיל.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sortedTithes.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => handleEdit(t)}
                  className="w-full flex items-center justify-between px-5 py-3 text-right hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                      <Heart className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t.recipient || "תרומה"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatHebrewDate(t.tithe_date)}{t.notes ? ` · ${t.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-foreground">{formatCurrency(t.amount)}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TitheFormDialog open={dialogOpen} onOpenChange={setDialogOpen} initialData={editItem} onSave={handleSave} />
    </div>
  );
}
