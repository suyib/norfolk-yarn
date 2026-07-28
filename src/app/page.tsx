import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/products";

const WEIGHTS = ["4 PLY / SPORT", "CHUNKY / SUPER CHUNKY", "DK / DK WORSTED", "LACE & ARAN"];

const WHY_SHOP_WITH_US = [
  "Local, Norwich-based business.",
  "Wide range of yarn, accessories, patterns and books.",
  "In-store click & collect.",
];

export default async function Home() {
  const products = await getAllProducts();
  const saleVariants = products.flatMap((p) =>
    p.variants.slice(0, 3).map((v) => ({ product: p, variant: v })),
  );

  return (
    <div className="flex flex-col bg-background">
      {/* Hero — no real photography yet, so a solid brand-colour block stands in. */}
      <div className="relative flex h-[313px] items-center justify-end overflow-hidden bg-forest px-6">
        <div className="flex max-w-[280px] flex-col items-end gap-4 text-right">
          <h1 className="font-heading text-5xl font-bold leading-tight text-cream">A knitters&rsquo; paradise</h1>
          <p className="text-soft-white">Find what you need from our wide range of yarn, books, needles, and more.</p>
          <div className="flex w-full gap-2">
            <Link
              href="/shop"
              className="flex-1 rounded-full bg-soft-white px-5 py-2.5 text-center font-bold text-forest"
            >
              Shop Yarn
            </Link>
            <Link
              href="#"
              className="flex-1 rounded-full border border-taupe px-5 py-2.5 text-center font-bold text-ink"
            >
              Workshops
            </Link>
          </div>
        </div>
      </div>

      {saleVariants.length > 0 && (
        <section className="px-6 py-8">
          <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Summer Sale</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {saleVariants.map(({ product, variant }) => (
              <ProductCard
                key={variant.id}
                href={`/products/${product.handle}`}
                title={product.title}
                subtitle={variant.shade_name}
                pricePennies={variant.price_pennies}
                swatchHex={variant.swatch_hex}
              />
            ))}
          </div>
        </section>
      )}

      {/* Workshops — decorative, no workshop system built yet. */}
      <div className="relative flex h-[310px] flex-col justify-center gap-8 bg-forest px-6">
        <h2 className="max-w-[240px] font-heading text-5xl font-bold text-cream">Workshops</h2>
        <p className="max-w-[190px] text-tan">Small groups in store. Click for more details.</p>
        <Link href="#" className="w-fit rounded-full bg-heather px-5 py-2.5 font-bold text-heather-foreground">
          View Dates
        </Link>
      </div>

      <section className="px-6 py-8">
        <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Shop by Weight</h2>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {WEIGHTS.map((weight) => (
            <Link
              key={weight}
              href="/shop"
              className="rounded-2xl border border-sage bg-white px-2 py-3 text-center text-lg font-bold uppercase tracking-wide text-ink-muted"
            >
              {weight}
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by category — decorative; Books/Needles aren't real categories yet. */}
      <section className="px-6 pb-8">
        <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Shop by Category</h2>
        <div className="mt-4 flex gap-2.5">
          {["Books", "Needles"].map((category) => (
            <Link
              key={category}
              href="#"
              className="flex flex-1 flex-col items-center gap-4 rounded-2xl border border-mist bg-white p-4"
            >
              <div className="h-[219px] w-full rounded-lg bg-sage" />
              <p className="font-bold tracking-wide text-ink">{category.toUpperCase()}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-6 pb-8">
        <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Why Shop With Us</h2>
        <ul className="flex flex-col gap-3">
          {WHY_SHOP_WITH_US.map((reason) => (
            <li key={reason} className="flex gap-2 text-ink-muted">
              <span aria-hidden className="mt-1 size-[18px] shrink-0 rounded-full bg-ink-muted" />
              {reason}
            </li>
          ))}
        </ul>
        <Link href="#" className="w-fit rounded-full bg-heather px-5 py-2.5 font-bold text-heather-foreground">
          Read More
        </Link>
      </section>
    </div>
  );
}
