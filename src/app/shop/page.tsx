import { NavArrowDown } from "iconoir-react";
import { ProductCard } from "@/components/product-card";
import { getAllProducts } from "@/lib/products";

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6 bg-background px-6 py-6">
      <p className="text-sm font-bold tracking-wide text-muted-warm">Home / Shop</p>
      <h1 className="font-heading text-3xl font-bold text-ink">Yarn</h1>
      <p className="text-sm font-bold tracking-wide text-ink-muted">
        {products.length} item{products.length === 1 ? "" : "s"}
      </p>

      {/* Filter/Sort are decorative for now — nothing to filter with a single product. */}
      <div className="flex gap-4">
        <button
          type="button"
          className="flex-1 rounded-full border border-forest bg-forest px-[17px] py-[9px] font-bold text-mist"
        >
          Filter
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-taupe bg-soft-white px-[17px] py-[9px] font-bold text-ink"
        >
          Sort By
          <NavArrowDown width={16} height={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.flatMap((product) => {
          const variant = product.variants.slice().sort((a, b) => a.position - b.position)[0];
          if (!variant) return [];
          return (
            <ProductCard
              key={product.id}
              href={`/products/${product.handle}`}
              title={product.title}
              subtitle={typeof product.specs?.weight === "string" ? product.specs.weight : ""}
              pricePennies={variant.price_pennies}
              swatchHex={variant.swatch_hex}
            />
          );
        })}
      </div>

      {products.length === 0 && <p className="text-ink-muted">No products yet.</p>}
    </div>
  );
}
