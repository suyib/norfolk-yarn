-- =============================================================================
-- Norfolk Yarn — 0001_schema.sql
-- Core schema. Postgres / Supabase.
--
-- Model decision (the dye-lot call, made concrete):
--   product  ->  variant (= colour)  ->  dye_lot (= batch under a colour)
--   Stock is NOT stored on the variant. A variant's sellable qty is the SUM of
--   its dye_lots. Most colours have exactly one lot; Silver Lining has two.
--   See the `variant_stock` view at the bottom.
--
-- Money is stored as integer pennies (GBP). Never use floats for money.
-- =============================================================================

create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type product_status as enum ('draft', 'active', 'archived');
create type variant_status as enum ('active', 'archived');
create type order_status   as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type user_role      as enum ('admin', 'staff');   -- Mandy = admin

-- -----------------------------------------------------------------------------
-- updated_at trigger helper
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles  (this is your `admin_users`/role, done the idiomatic Supabase way)
-- One row per auth.users row. RLS + the is_admin() helper read from here.
-- -----------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       user_role,               -- null = ordinary/no admin rights
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- Taxonomy
--   categories  — the primary "what is it" tree (Yarn, Needles, Patterns...).
--                 self-referencing parent_id allows one level of nesting.
--   collections — merchandising groupings (brand ranges, "DK weight", "New in").
--                 many-to-many with products.
-- -----------------------------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  handle     text not null unique,     -- slug, e.g. 'yarn'
  name       text not null,
  parent_id  uuid references categories(id) on delete set null,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

create table collections (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,    -- e.g. 'rowan'
  title       text not null,
  description text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- products
--   `specs` holds the structured yarn spec block (needle size, tension,
--   meterage, composition, wash care) that currently lives as prose on the PDP.
-- -----------------------------------------------------------------------------
create table products (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,    -- 'rowan-cotton-cashmere'
  title       text not null,
  brand       text,                    -- 'Rowan'
  description text,
  specs       jsonb not null default '{}'::jsonb,
  status      product_status not null default 'draft',
  category_id uuid references categories(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_products_category on products(category_id);
create index idx_products_status   on products(status);
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

create table product_collections (
  product_id    uuid not null references products(id)    on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

-- -----------------------------------------------------------------------------
-- variants  (= colour / shade). One row per shade the shop stocks.
--   No qty column — stock is the sum of this variant's dye_lots.
--   swatch_hex feeds the on-brand swatch grid on the PDP.
-- -----------------------------------------------------------------------------
create table variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  shade_name  text not null,           -- 'Silver Lining'
  shade_code  text,                    -- '224'
  sku         text unique,             -- 'SQ8134159'
  price_pennies int not null check (price_pennies >= 0),
  swatch_hex  text,                    -- '#B9BCC0'
  image_url   text,
  position    int not null default 0,  -- order in the swatch grid
  status      variant_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_variants_product on variants(product_id);
create trigger trg_variants_updated before update on variants
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- dye_lots  (= batch under a colour). THE table Shopify's model doesn't have.
--   A colour can hold several lots at once (Silver Lining = 10 + 5).
--   Sellable stock for the colour is sum(qty) across its lots.
-- -----------------------------------------------------------------------------
create table dye_lots (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references variants(id) on delete cascade,
  lot_code    text not null,           -- dye-lot number from the ball band
  qty         int  not null default 0 check (qty >= 0),
  received_at date,                    -- enables FIFO / "oldest lot first"
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (variant_id, lot_code)
);
create index idx_dye_lots_variant on dye_lots(variant_id);
create trigger trg_dye_lots_updated before update on dye_lots
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- orders + order_items
--   order_items snapshot title/shade/sku/price so the historical order stays
--   correct even if the catalogue changes later. dye_lot_id records which lot
--   was allocated, giving the Stripe webhook (step 11) a precise decrement
--   target and making matched-lot ordering possible down the line.
-- -----------------------------------------------------------------------------
create sequence order_number_seq start 1000;

create table orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        int  not null default nextval('order_number_seq') unique,
  email               text,
  customer_name       text,
  status              order_status not null default 'pending',
  currency            text not null default 'GBP',
  subtotal_pennies    int  not null default 0,
  shipping_pennies    int  not null default 0,
  total_pennies       int  not null default 0,
  shipping_address    jsonb,
  stripe_session_id   text unique,      -- guards webhook idempotency (step 11)
  stripe_payment_intent text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_orders_status on orders(status);
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references orders(id) on delete cascade,
  variant_id        uuid references variants(id) on delete set null,
  dye_lot_id        uuid references dye_lots(id) on delete set null,
  -- snapshots (immutable record of what was actually bought):
  product_title     text not null,
  shade_name        text,
  sku               text,
  lot_code          text,
  qty               int  not null check (qty > 0),
  unit_price_pennies int not null check (unit_price_pennies >= 0),
  line_total_pennies int not null check (line_total_pennies >= 0),
  created_at        timestamptz not null default now()
);
create index idx_order_items_order   on order_items(order_id);
create index idx_order_items_variant on order_items(variant_id);

-- -----------------------------------------------------------------------------
-- Derived stock views — read these anywhere you need "how many in this colour".
-- -----------------------------------------------------------------------------
create view variant_stock as
  select v.id as variant_id,
         v.product_id,
         coalesce(sum(dl.qty), 0)::int as total_qty,
         count(dl.id)::int             as lot_count
  from variants v
  left join dye_lots dl on dl.variant_id = v.id
  group by v.id, v.product_id;

create view product_stock as
  select p.id as product_id,
         coalesce(sum(dl.qty), 0)::int as total_qty
  from products p
  left join variants v on v.product_id = p.id
  left join dye_lots dl on dl.variant_id = v.id
  group by p.id;
