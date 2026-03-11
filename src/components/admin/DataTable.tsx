import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Download, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";

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
}

export function DataTable<T extends Record<string, any>>({
  data, columns, title, onAdd, addLabel = "הוספה", onExport, searchPlaceholder = "חיפוש...", onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    columns.some((col) => {
      const val = item[col.key];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    })
  );

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
          {onExport && (
            <Button variant="outline" size="sm" className="rounded-xl hover-lift border-border/60">
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
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
              {onRowClick && <TableHead className="w-10"></TableHead>}
              {columns.map((col) => (
                <TableHead key={col.key} className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/80">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                    <p>לא נמצאו תוצאות</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow
                  key={i}
                  className="group hover:bg-primary/[0.03] transition-all duration-200 border-border/30 cursor-pointer"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {onRowClick && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                        onClick={() => onRowClick(item, i)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3.5" onClick={() => onRowClick?.(item, i)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
