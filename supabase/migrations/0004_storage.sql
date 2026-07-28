-- =============================================================================
-- Norfolk Yarn — 0004_storage.sql
-- Storage bucket for product images. Public read (product photos are shown
-- to anyone), admin-only write — mirrors the catalogue RLS pattern in
-- 0002_rls.sql, reusing the same is_admin() helper.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin write product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
