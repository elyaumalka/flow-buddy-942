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
    <Card className="animate-fade-in">
      <div className="p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 w-full sm:w-64"
            />
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 ml-1" />
              ייצוא
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 ml-1" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onRowClick && <TableHead className="w-10"></TableHead>}
              {columns.map((col) => (
                <TableHead key={col.key} className="text-right">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                  לא נמצאו תוצאות
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow key={i} className={`hover:bg-muted/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}>
                  {onRowClick && (
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRowClick(item, i)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key}>
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
