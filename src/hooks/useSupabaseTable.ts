import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TableName = "leads" | "partners" | "marketers" | "customers" | "tasks" | "tickets" | "payments" | "collections" | "commissions" | "income" | "expenses" | "goals" | "tithes" | "coupons";

export function useSupabaseTable<T extends Record<string, any>>(
  table: TableName,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    userScoped?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const orderBy = options?.orderBy || "created_at";
  const ascending = options?.ascending ?? false;

  const query = useQuery({
    queryKey: [table],
    queryFn: async () => {
      let q = supabase.from(table).select("*").order(orderBy, { ascending });
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as T[];
    },
  });

  const insertMutation = useMutation({
    mutationFn: async (item: Partial<T>) => {
      if (options?.userScoped) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) (item as any).user_id = user.id;
      }
      const { data, error } = await supabase.from(table).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (err: any) => {
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<T>) => {
      const { data, error } = await supabase.from(table).update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (err: any) => {
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (err: any) => {
      toast({ title: "שגיאה", description: err.message, variant: "destructive" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<T> }) => {
      const { error } = await supabase.from(table).update(updates as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from(table).delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
    onError: (err: any) => toast({ title: "שגיאה", description: err.message, variant: "destructive" }),
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    insert: insertMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    bulkRemove: bulkDeleteMutation.mutateAsync,
    isInserting: insertMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
