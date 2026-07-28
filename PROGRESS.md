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

**5. PDP** ✅ — `src/app/products/[handle]/page.tsx` + `src/components/pdp/product-detail.tsx`. Real product/specs/variants/dye-lots from Supabase; colour swatch picker switches variant + price; a dye-lot note panel appears only when the selected variant has >1 lot (Silver Lining); stock summed from `dye_lots`, qty stepper capped at it; sticky bottom add-to-cart bar. "Recently Viewed" omitted — one product would just repeat itself.
**6. PLP + home** ✅ — `src/app/shop/page.tsx` (flat product list — only one category exists, so no `/shop/[category]`) and `src/app/page.tsx` (hero, Summer Sale using real variants, decorative Workshops/Shop-by-Weight/Shop-by-Category tiles, Why Shop With Us). Design tokens corrected from Figma's actual PDP/PLP export: fonts are **Josefin Sans** + **Abhaya Libre** (both free Google Fonts via `next/font/google`) — not Sofia Pro/FreightBig Pro as first assumed from the manually-exported homepage HTML — fully resolving the font-licensing gap. Added `--color-evergreen` (`#9CC0B0`), the one new colour the PDP/PLP export surfaced. Icons sourced from `iconoir-react` (matches the Figma layer names, e.g. `icon/iconoir/plus`) rather than hand-drawn SVGs.
**7. Cart** ✅ — `src/components/cart/cart-context.tsx`: basket + "saved for later", persisted to `localStorage` (confirmed with the user over a server-side session table — kept it pure client-side, no new schema/API surface). `src/app/cart/page.tsx` wires Checkout to the existing `/api/checkout`, redirecting to the real Stripe session URL. `src/app/checkout/{success,cancelled}/page.tsx` fix the 404 hit earlier when testing the webhook — success clears the cart, cancelled leaves it intact.
- Known gap: the Norfolk Yarn logo is real brand artwork that couldn't be fetched from Figma (the exported asset URLs are the user's local Figma desktop app dev server, unreachable here) — using a text wordmark placeholder until the real logo file is provided.

## Admin

**8. Admin auth** ✅ — Supabase Auth + role check (`profiles.role = 'admin'`), admin account live for tungsuyin@gmail.com. `auth.users` → `profiles` sync trigger (`0003_auth_trigger.sql`) fixes the earlier gap where signups had no profiles row. The auth/role gate now lives once in `src/app/admin/layout.tsx` (was duplicated per-page) with a shared nav (Products/Orders/Sign out). The one-off "test admin write" button is gone — its job (proving `is_admin()` gates writes) is done, and `/admin` is now a real dashboard.
**9. Product & stock management** ✅ — Admin UI on top of the CRUD API built earlier: `/admin/products` (list with stock rollup), `/admin/products/new` + `/admin/products/[id]` (`src/components/admin/product-editor.tsx`) for editing product fields, inline variant add/edit/delete, and per-variant dye-lot add/edit/delete — mirrors the schema's product → variant → dye_lot hierarchy directly. Image upload wired to the `product-images` Storage bucket (`0004_storage.sql`) straight from the browser Supabase client, gated by the same `is_admin()` storage policies. Reads are direct Supabase queries in Server Components (no `status = 'active'` filter, unlike the storefront, so drafts/archived are visible); writes go through the existing `/api/admin/*` routes via `fetch()` + `router.refresh()`.
**10. Orders / sales view** ✅ — `/admin/orders` (list) and `/admin/orders/[id]` (detail with line items) as Server Components querying directly; `/admin` dashboard shows paid-order revenue/count/product count. Read-only — no order-status editing UI (not asked for; the schema supports it if needed later).
- Scope note: "page content" editing (homepage hero text, etc.) was explicitly descoped by the user — that copy stays hardcoded in the storefront components, not database-backed.

## Checkout & ship

**11. Stripe Checkout (test mode)** ✅ — `POST /api/checkout` (`src/app/api/checkout/route.ts`) allocates one dye lot per line item, creates a pending `orders`/`order_items` row via the service_role client, then a Stripe Checkout Session with `orderId` in metadata. `POST /api/webhooks/stripe` (`src/app/api/webhooks/stripe/route.ts`) verifies the signature, and on `checkout.session.completed` decrements the allocated lots and flips the order to `paid` — guarded by `order.status === 'pending'` so a redelivered webhook can't double-decrement. Verified end-to-end against real Stripe test mode + the live Supabase project: Silver Lining's lot A went 10 → 8 after a real card payment, lot B untouched. No cart UI yet (step 7) — the flow is only reachable via curl/Stripe CLI for now.
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
