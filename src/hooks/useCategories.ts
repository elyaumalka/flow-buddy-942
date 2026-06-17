import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
} from "@/lib/financeConstants";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: string; // income | expense | liability | asset
  category_type: string; // קבוע | משתנה
  period: string | null;
  extension: string | null;
  tithe_liable: boolean;
  tithe_offset: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Customer-defined categories. Falls back to sensible defaults (names only)
 * when the user hasn't created any of a given kind yet.
 */
export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as Category[];
    },
  });

  const all = query.data || [];
  const active = all.filter((c) => !c.archived);

  const namesByKind = (kind: string, fallback: string[]) => {
    const names = active.filter((c) => c.kind === kind).map((c) => c.name);
    return names.length ? names : fallback;
  };

  const incomeCategories = namesByKind("income", DEFAULT_INCOME_CATEGORIES);
  const expenseCategories = namesByKind("expense", DEFAULT_EXPENSE_CATEGORIES);

  const create = useMutation({
    mutationFn: async (item: Partial<Category>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...item, user_id: user?.id };
      const { data, error } = await supabase.from("categories").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => toast({ title: "שגיאה", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Category>) => {
      const { error } = await supabase.from("categories").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => toast({ title: "שגיאה", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => toast({ title: "שגיאה", description: e.message, variant: "destructive" }),
  });

  const bulkRemove = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("categories").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: any) => toast({ title: "שגיאה", description: e.message, variant: "destructive" }),
  });

  return {
    all,
    active,
    incomeCategories,
    expenseCategories,
    isLoading: query.isLoading,
    createCategory: create.mutateAsync,
    updateCategory: update.mutateAsync,
    removeCategory: remove.mutateAsync,
    bulkRemoveCategories: bulkRemove.mutateAsync,
  };
}
