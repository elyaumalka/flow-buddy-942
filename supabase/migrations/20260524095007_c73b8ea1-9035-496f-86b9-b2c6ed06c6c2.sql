
insert into storage.buckets (id, name, public) values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "Users can upload own reports"
on storage.objects for insert to authenticated
with check (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own reports"
on storage.objects for select to authenticated
using (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own reports"
on storage.objects for delete to authenticated
using (bucket_id = 'reports' and (storage.foldername(name))[1] = auth.uid()::text);
