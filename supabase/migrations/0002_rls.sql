-- =============================================================================
-- Norfolk Yarn — 0002_rls.sql
-- Row Level Security. Set BEFORE building on top, so the baseline is never open.
--
-- Rules:
--   * Catalogue (products, variants, dye_lots, taxonomy) — public SELECT.
--   * All writes — admin only.
--   * Orders / order_items — admin SELECT only; no public access.
--   * The Stripe webhook uses the service_role key, which BYPASSES RLS, so it
--     can create orders and decrement stock server-side without a policy.
-- =============================================================================

-- Helper: is the current user an admin? (SECURITY DEFINER so it can read
-- profiles regardless of the caller's own RLS.)
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Enable RLS everywhere -------------------------------------------------------
alter table profiles            enable row level security;
alter table categories          enable row level security;
alter table collections         enable row level security;
alter table products            enable row level security;
alter table product_collections enable row level security;
alter table variants            enable row level security;
alter table dye_lots            enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;

-- profiles --------------------------------------------------------------------
create policy "own profile read"  on profiles for select using (id = auth.uid() or is_admin());
create policy "admin profile write" on profiles for all using (is_admin()) with check (is_admin());

-- Catalogue: public read, admin write ----------------------------------------
-- (POC keeps read simple: anyone can read the catalogue. Tighten to
--  status = 'active' later if draft products must stay hidden from anon.)
create policy "public read categories"          on categories          for select using (true);
create policy "public read collections"         on collections         for select using (true);
create policy "public read products"            on products            for select using (true);
create policy "public read product_collections" on product_collections for select using (true);
create policy "public read variants"            on variants            for select using (true);
create policy "public read dye_lots"            on dye_lots            for select using (true);

create policy "admin write categories"          on categories          for all using (is_admin()) with check (is_admin());
create policy "admin write collections"         on collections         for all using (is_admin()) with check (is_admin());
create policy "admin write products"            on products            for all using (is_admin()) with check (is_admin());
create policy "admin write product_collections" on product_collections for all using (is_admin()) with check (is_admin());
create policy "admin write variants"            on variants            for all using (is_admin()) with check (is_admin());
create policy "admin write dye_lots"            on dye_lots            for all using (is_admin()) with check (is_admin());

-- Orders: admin read only. Writes happen via service_role (bypasses RLS). -----
create policy "admin read orders"       on orders      for select using (is_admin());
create policy "admin read order_items"  on order_items for select using (is_admin());
