-- =============================================================================
-- Norfolk Yarn — seed.sql
-- Rowan Cotton Cashmere with its shades, and Silver Lining's two dye lots.
--
-- CONFIRMED REAL (from the PDP we pulled):
--   224 Silver Lining — SKU SQ8134159 — 15 total = 10 in one lot + 5 in another.
--
-- PROVISIONAL (marked below): the other eight shades use plausible Cotton
--   Cashmere names + approximate swatch hexes + sample quantities, and SKUs
--   prefixed 'TBC-'. Paste the real catalogue JSON and these get swapped for
--   exact names / SKUs / quantities. Structurally everything is correct now.
-- =============================================================================

-- Taxonomy --------------------------------------------------------------------
insert into categories (id, handle, name, position) values
  ('11111111-1111-1111-1111-111111111111', 'yarn', 'Yarn', 0);

insert into collections (id, handle, title, description, position) values
  ('22222222-2222-2222-2222-222222222222', 'rowan', 'Rowan', 'Rowan yarn ranges', 0);

-- Product ---------------------------------------------------------------------
insert into products (id, handle, title, brand, description, specs, status, category_id) values (
  '33333333-3333-3333-3333-333333333333',
  'rowan-cotton-cashmere',
  'Rowan Cotton Cashmere',
  'Rowan',
  'A luxurious blend of cotton and cashmere with a soft handle and gentle drape — a DK-weight yarn suited to garments and accessories worn next to the skin.',
  jsonb_build_object(
    'weight',      'DK',
    'needle_size', '4mm (UK 8 / US 6)',
    'tension',     '22 sts x 30 rows to 10cm',
    'meterage',    '130m / 50g ball',
    'composition', '85% Cotton, 15% Cashmere',
    'wash_care',   'Machine wash 30°C, dry flat'
  ),
  'active',
  '11111111-1111-1111-1111-111111111111'
);

insert into product_collections (product_id, collection_id) values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222');

-- Variants (shades) -----------------------------------------------------------
-- price_pennies 725 = £7.25 per ball (adjust to the shop's real price).
insert into variants (id, product_id, shade_name, shade_code, sku, price_pennies, swatch_hex, position, status) values
  -- CONFIRMED
  ('a0000000-0000-0000-0000-000000000224', '33333333-3333-3333-3333-333333333333', 'Silver Lining', '224', 'SQ8134159', 725, '#B9BCC0', 0, 'active'),
  -- PROVISIONAL — replace from catalogue JSON
  ('a0000000-0000-0000-0000-000000000210', '33333333-3333-3333-3333-333333333333', 'Cream',         '210', 'TBC-210',   725, '#F3ECDD', 1, 'active'),
  ('a0000000-0000-0000-0000-000000000211', '33333333-3333-3333-3333-333333333333', 'Quartz',        '211', 'TBC-211',   725, '#D8B8B4', 2, 'active'),
  ('a0000000-0000-0000-0000-000000000214', '33333333-3333-3333-3333-333333333333', 'Cardamom',      '214', 'TBC-214',   725, '#B7A66B', 3, 'active'),
  ('a0000000-0000-0000-0000-000000000216', '33333333-3333-3333-3333-333333333333', 'Persimmon',     '216', 'TBC-216',   725, '#C96B4A', 4, 'active'),
  ('a0000000-0000-0000-0000-000000000217', '33333333-3333-3333-3333-333333333333', 'Damson',        '217', 'TBC-217',   725, '#6E4A5E', 5, 'active'),
  ('a0000000-0000-0000-0000-000000000220', '33333333-3333-3333-3333-333333333333', 'Cygnet',        '220', 'TBC-220',   725, '#4C4F55', 6, 'active'),
  ('a0000000-0000-0000-0000-000000000223', '33333333-3333-3333-3333-333333333333', 'Kingfisher',    '223', 'TBC-223',   725, '#2E6E7E', 7, 'active'),
  ('a0000000-0000-0000-0000-000000000225', '33333333-3333-3333-3333-333333333333', 'Denim',         '225', 'TBC-225',   725, '#3E5A78', 8, 'active');

-- Dye lots --------------------------------------------------------------------
-- Silver Lining: the whole point — two real lots instead of one qty of 15.
insert into dye_lots (variant_id, lot_code, qty, note) values
  ('a0000000-0000-0000-0000-000000000224', 'A', 10, 'First lot'),
  ('a0000000-0000-0000-0000-000000000224', 'B',  5, 'Second lot — slight shade difference; do not mix within one project');

-- Every other shade: a single lot (the common case).
insert into dye_lots (variant_id, lot_code, qty) values
  ('a0000000-0000-0000-0000-000000000210', '1', 24),
  ('a0000000-0000-0000-0000-000000000211', '1', 18),
  ('a0000000-0000-0000-0000-000000000214', '1', 12),
  ('a0000000-0000-0000-0000-000000000216', '1',  9),
  ('a0000000-0000-0000-0000-000000000217', '1', 15),
  ('a0000000-0000-0000-0000-000000000220', '1', 20),
  ('a0000000-0000-0000-0000-000000000223', '1',  7),
  ('a0000000-0000-0000-0000-000000000225', '1', 16);

-- Sanity check after seeding:
--   select v.shade_name, vs.total_qty, vs.lot_count
--   from variant_stock vs join variants v on v.id = vs.variant_id
--   order by v.position;
-- Expect Silver Lining -> total_qty 15, lot_count 2.
