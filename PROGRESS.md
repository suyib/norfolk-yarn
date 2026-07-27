# Norfolk Yarn — build progress

Living tracker. Updated as we go. Stack: Next.js (App Router) + Tailwind + shadcn + Supabase + Stripe, deployed to Vercel.

Legend: ✅ done · 🟡 in progress / partial · ⬜ not started

---

## Foundation

**1. Scaffold** ✅
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui, `src/` layout. Deployed to Vercel (`norfolk-yarn.vercel.app`), connected to GitHub (`suyib/norfolk-yarn`) for auto-deploy on push. `lib/supabase/{client,server,admin}.ts` and `lib/stripe.ts` scaffolded; `proxy.ts` refreshes the Supabase session cookie on every request (Next 16 renamed `middleware.ts` → `proxy.ts` — used the new convention). `.env.example` lists every var needed; `.gitignore` already excludes `.env*`.

Design tokens replaced with the real ones extracted from the Figma homepage export (node `8-92`), superseding the earlier brand-sheet guess:
- Colours: soft-white `#FCFCF8`, forest `#0F3B2F`, heather `#9E6675`, camel `#B89B5E` (kept from the brand sheet, not seen on this screen), plus text tones (`ink` `#2B2B24`, `ink-muted` `#4C4C40`, `muted-warm` `#7C7C6D`), surfaces/borders (`cream` `#FAFFEC`, `mist` `#EDF3EF`, `sage` `#CFE0D7`, `tan` `#DAD5C6`, `taupe` `#ABAA99`, `heather-foreground` `#F6EDEF`), and a status colour (`sale` `#B24A3C`). All wired into shadcn's semantic tokens in `globals.css`.
- Fonts: headings use **FreightBig Pro**, body/UI uses **Sofia Pro** — both commercial, not bundled. Currently fall back to system fonts (Georgia / ui-sans-serif). Needs licensed webfont files before real pages will render in the correct typefaces — see "Outside this scaffold".
- Dark mode still left on shadcn's generic greyscale — brand has no defined dark palette.

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

**11. Stripe Checkout (test mode)** ✅ (backend) — `POST /api/checkout` (`src/app/api/checkout/route.ts`) allocates one dye lot per line item, creates a pending `orders`/`order_items` row via the service_role client, then a Stripe Checkout Session with `orderId` in metadata. `POST /api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts`) verifies the signature, and on `checkout.session.completed` decrements the allocated lots and flips the order to `paid` — guarded by `order.status === 'pending'` so a redelivered webhook can't double-decrement. No cart UI yet (step 7), so this is only reachable via curl/Stripe CLI for now — see below for how to test it.
- Parked for the real project: webhook hardening beyond the idempotency check already in place, cross-lot splitting when no single lot covers the quantity, and EPOS/stock-system integration.
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
- Only the homepage (node `8-92`) has been pulled from Figma — PDP/PLP/cart screens still need the same treatment when step 5-7 starts.

## Outside this scaffold (needs manual setup)
- **Font licences**: FreightBig Pro and Sofia Pro are commercial fonts referenced by the Figma export but not included anywhere. Buy/download the webfont files (woff2), then wire them in via `next/font/local` in `layout.tsx`. Until then the site renders in system font fallbacks.
- **First run locally**: `npm install` (already done by the scaffold), copy `.env.example` → `.env.local` and fill it in with the real Supabase/Stripe values, then `npm run dev`.
