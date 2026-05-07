import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Download, Pencil, Trash2, X, LucideIcon, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface FilterDef {
  key: string;
  label: string;
  options?: string[]; // if omitted, derived from data
}

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  onExport?: () => void;
  searchPlaceholder?: string;
  onRowClick?: (item: T, index: number) => void;
  onBulkEdit?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => Promise<void> | void;
  extraBulkActions?: Array<{ label: string; icon?: LucideIcon; onClick: (ids: string[]) => void; variant?: "default" | "outline" | "secondary" }>;
  extraRowActions?: Array<{ label: string; icon: LucideIcon; onClick: (item: any) => void }>;
  filters?: FilterDef[];
}

export function DataTable<T extends Record<string, any>>({
  data, columns, title, onAdd, addLabel = "הוספה", onExport, searchPlaceholder = "חיפוש...", onRowClick, onBulkEdit, onBulkDelete, extraBulkActions, extraRowActions, filters,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const selectable = !!(onBulkEdit || onBulkDelete);

  const filterOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    (filters ?? []).forEach((f) => {
      if (f.options) { map[f.key] = f.options; return; }
      const set = new Set<string>();
      data.forEach((it: any) => { const v = it[f.key]; if (v != null && v !== "") set.add(String(v)); });
      map[f.key] = Array.from(set).sort();
    });
    return map;
  }, [filters, data]);

  const filtered = useMemo(() => data.filter((item) => {
    for (const [k, v] of Object.entries(activeFilters)) {
      if (v && String((item as any)[k] ?? "") !== v) return false;
    }
    if (!search) return true;
    return columns.some((col) => {
      const val = (item as any)[col.key];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    });
  }), [data, columns, search, activeFilters]);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const allFilteredIds = filtered.map((i: any) => i.id).filter(Boolean);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = allFilteredIds.some((id) => selected.has(id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) allFilteredIds.forEach((id) => next.delete(id));
      else allFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSel = () => setSelected(new Set());
  const selectedIds = Array.from(selected);

  return (
    <Card className="card-premium animate-slide-up overflow-hidden">
      <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-l from-primary/[0.02] to-transparent">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 w-full sm:w-64 rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
            />
          </div>
          {filters && filters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl hover-lift border-border/60 relative">
                  <Filter className="h-4 w-4 ml-1" />
                  סינון
                  {activeFilterCount > 0 && (
                    <span className="mr-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent dir="rtl" className="w-72 rounded-2xl space-y-3" align="end">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">סינון מתקדם</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg" onClick={() => setActiveFilters({})}>
                      <X className="h-3 w-3 ml-1" /> נקה
                    </Button>
                  )}
                </div>
                {filters.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-xs font-semibold">{f.label}</Label>
                    <Select
                      value={activeFilters[f.key] ?? "__all__"}
                      onValueChange={(v) => setActiveFilters((p) => ({ ...p, [f.key]: v === "__all__" ? "" : v }))}
                    >
                      <SelectTrigger className="rounded-xl h-9"><SelectValue placeholder="הכל" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="__all__">הכל</SelectItem>
                        {filterOptions[f.key]?.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}
          {onExport && (
            <Button variant="outline" size="sm" className="rounded-xl hover-lift border-border/60" onClick={onExport}>
              <Download className="h-4 w-4 ml-1" />
              ייצוא
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd} className="rounded-xl gradient-primary border-0 shadow-glow-sm hover:shadow-glow transition-shadow">
              <Plus className="h-4 w-4 ml-1" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {selectable && selectedIds.length > 0 && (
        <div className="px-5 py-3 border-b border-primary/20 bg-primary/[0.06] flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">{selectedIds.length} נבחרו</span>
            <Button variant="ghost" size="sm" onClick={clearSel} className="h-7 rounded-lg text-xs">
              <X className="h-3 w-3 ml-1" /> נקה בחירה
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {onBulkEdit && (
              <Button size="sm" onClick={() => onBulkEdit(selectedIds)} className="rounded-xl gradient-primary border-0 shadow-glow-sm">
                <Pencil className="h-3.5 w-3.5 ml-1" /> עריכה קבוצתית
              </Button>
            )}
            {extraBulkActions?.map((a, idx) => {
              const Icon = a.icon;
              return (
                <Button key={idx} size="sm" variant={a.variant ?? "secondary"} onClick={() => { a.onClick(selectedIds); }} className="rounded-xl">
                  {Icon && <Icon className="h-3.5 w-3.5 ml-1" />} {a.label}
                </Button>
              );
            })}
            {onBulkDelete && (
              <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)} className="rounded-xl">
                <Trash2 className="h-3.5 w-3.5 ml-1" /> מחיקה
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
              {onRowClick && <TableHead className="w-10"></TableHead>}
              {columns.map((col) => (
                <TableHead key={col.key} className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/80">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                    <p>לא נמצאו תוצאות</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item: any, i) => {
                const isSel = selected.has(item.id);
                return (
                  <TableRow
                    key={item.id ?? i}
                    className={`group transition-all duration-200 border-border/30 ${isSel ? "bg-primary/[0.06]" : "hover:bg-primary/[0.03]"}`}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox checked={isSel} onCheckedChange={() => item.id && toggleOne(item.id)} />
                      </TableCell>
                    )}
                    {onRowClick && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="עריכה"
                            className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                            onClick={() => onRowClick(item, i)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {extraRowActions?.map((a, idx) => {
                            const Icon = a.icon;
                            return (
                              <Button
                                key={idx}
                                variant="ghost"
                                size="icon"
                                title={a.label}
                                className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => { e.stopPropagation(); a.onClick(item); }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} className="py-3.5 cursor-pointer" onClick={() => onRowClick?.(item, i)}>
                        {col.render ? col.render(item) : item[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent dir="rtl" className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת {selectedIds.length} רשומות</AlertDialogTitle>
            <AlertDialogDescription>פעולה זו אינה ניתנת לביטול. הרשומות הנבחרות יימחקו לצמיתות.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={async () => { await onBulkDelete?.(selectedIds); clearSel(); }}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
