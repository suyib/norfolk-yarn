# Norfolk Yarn — build progress

Living tracker. Updated as we go. Stack: Next.js (App Router) + Tailwind + shadcn + Supabase + Stripe, deployed to Vercel.

Legend: ✅ done · 🟡 in progress / partial · ⬜ not started

---

## Foundation

**1. Scaffold** 🟡
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui, `src/` layout. Brand tokens (soft-white `#FCFCF8`, forest `#0F3B2F`, heather `#9E6675`, camel `#B89B5E`) wired into `globals.css` and into shadcn's semantic tokens (`background`/`foreground`/`primary`/`secondary`/`accent`) so `bg-primary` etc. render on-brand. `lib/supabase/{client,server,admin}.ts` and `lib/stripe.ts` scaffolded; `proxy.ts` refreshes the Supabase session cookie on every request (Next 16 renamed `middleware.ts` → `proxy.ts` — used the new convention). `.env.example` lists every var needed; `.gitignore` already excludes `.env*`. Build verified clean (`npm run build`).
- Still open: no real Supabase project or Vercel project exists yet — see "Outside this scaffold" below. Type scale from the brand sheet not yet ported (only colours were specified). Dark mode left on shadcn's generic greyscale — brand has no defined dark palette.

**2. Schema** ✅
Tables: `profiles` (role), `categories`, `collections`, `product_collections`, `products`, `variants`, `dye_lots`, `orders`, `order_items`. Stock lives in `dye_lots`; `variant_stock` / `product_stock` views sum it up. Money as integer pennies. Verified on real Postgres 16 — runs clean.
→ `supabase/migrations/0001_schema.sql`

**3. RLS** ✅
Public read on catalogue; all writes gated to `is_admin()`; orders admin-read-only; webhook writes go through `service_role` (bypasses RLS). Verified: anon reads catalogue, anon writes rejected.
→ `supabase/migrations/0002_rls.sql`

**4. Seed** 🟡
Cotton Cashmere + 9 shades + Silver Lining's two lots (10 + 5 = 15, verified). **Only 224 Silver Lining is confirmed real** (SKU SQ8134159); the other 8 shades are provisional (`TBC-` SKUs, sample qty, approx hex) pending the real catalogue JSON.
→ `supabase/seed.sql`
- TODO: swap provisional shades for exact names / SKUs / quantities from the catalogue JSON.
- TODO: nothing has been run against a live database yet — migrations + seed are verified SQL, not yet applied to an actual Supabase project (none exists). See "Outside this scaffold" below.

---

## Storefront

**5. PDP** ⬜ — swatch grid from `variants`, dye-lot panel from `dye_lots`, add-to-cart. Build first.
**6. PLP + home** ⬜ — reuse PDP patterns + wireframes, mobile-first.
**7. Cart** ⬜ — simple session/client cart; don't over-build.

## Admin

**8. Admin auth** 🟡 — Supabase Auth + role check (`profiles.role = 'admin'`) for Mandy. Backend prioritised ahead of frontend (steps 5-7 deferred). Added the missing `auth.users` → `profiles` sync trigger (`0003_auth_trigger.sql`) — without it, signups had no profiles row and `is_admin()` silently returned false. First admin account being set up for tungsuyin@gmail.com. Still needed: sign-in/sign-out server actions.
**9. Product & stock management** ⬜ — CRUD for products/variants, dye-lot stock editing, image upload to Supabase Storage. Mine Shopify's product editor / variant table / inventory columns.
**10. Orders / sales view** ⬜ — order list + basic sales figures.

## Checkout & ship

**11. Stripe Checkout (test mode)** ⬜ — hosted session + webhook that marks order paid and decrements a **specific dye lot** (`order_items.dye_lot_id` is the target). Parked for the real project: webhook hardening (idempotency via `orders.stripe_session_id`, edge cases) and EPOS/stock-system integration.
**12. Deploy & polish** ⬜ — enough breadth to feel real; smooth mobile checkout with a Stripe test card.

---

## Key decisions locked
- **Colour = variant; dye lot = its own table under the variant.** Stock is the sum of lots, not a single number. This is the thing the whole build exists to prove.
- **Money = integer pennies (GBP).** No floats.
- **`order_items` snapshots** title/shade/sku/lot + records the allocated `dye_lot_id`, so orders stay correct as the catalogue changes and per-lot decrement is possible.

## Open questions
- Real catalogue JSON for the 8 provisional shades (names, SKUs, quantities).
- Per-ball price — seed uses £7.25 as a placeholder.
- EST year on the brand sheet: 2004 vs About page 2005 — confirm with Mandy.
- Type scale from the brand sheet (only the 4 colours were ported into the scaffold).

## Outside this scaffold (needs manual setup)
- **Supabase project**: none exists yet. Create one, run `0001_schema.sql` → `0002_rls.sql` → `seed.sql` against it (SQL editor or `supabase db push`), then copy its URL/anon key/service_role key into `.env.local` (git-ignored, not committed).
- **Stripe**: create a test-mode account/keys, add `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`. `STRIPE_WEBHOOK_SECRET` comes from `stripe listen` locally or the dashboard once step 11 exists.
- **Vercel**: no project linked yet. `vercel link` / import the repo, then mirror the same env vars into the Vercel project settings.
- **Git**: this directory isn't a git repo yet (no `.git`) — `git init` and an initial commit whenever you want history started.
- **First run locally**: `npm install` (already done by the scaffold), copy `.env.example` → `.env.local` and fill it in, then `npm run dev`.
