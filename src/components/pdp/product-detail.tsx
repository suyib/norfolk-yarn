"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";
import { variantStock, type ProductWithVariants } from "@/lib/product-types";

const SPEC_LABELS: Record<string, string> = {
  weight: "Weight",
  needle_size: "Needle size",
  tension: "Tension",
  meterage: "Meterage",
  composition: "Composition",
  wash_care: "Wash care",
};

export function ProductDetail({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();
  const sortedVariants = useMemo(
    () => [...product.variants].sort((a, b) => a.position - b.position),
    [product.variants],
  );
  const [selectedId, setSelectedId] = useState(sortedVariants[0]?.id);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const variant = sortedVariants.find((v) => v.id === selectedId) ?? sortedVariants[0];
  const stock = variant ? variantStock(variant) : 0;
  const multiLot = (variant?.dye_lots.length ?? 0) > 1;

  const selectVariant = (id: string) => {
    setSelectedId(id);
    setQty(1);
    setJustAdded(false);
  };

  const handleAddToCart = () => {
    if (!variant || stock <= 0) return;
    addItem(
      {
        variantId: variant.id,
        productHandle: product.handle,
        productTitle: product.title,
        shadeName: variant.shade_name,
        swatchHex: variant.swatch_hex,
        pricePennies: variant.price_pennies,
      },
      qty,
    );
    setJustAdded(true);
  };

  if (!variant) return null;

  return (
    <div className="flex flex-col gap-8 pb-28">
      <p className="px-6 pt-6 text-sm font-bold tracking-wide text-muted-warm">
        Home / Yarn / {product.brand} / {product.title}
      </p>

      {/* No real product photography yet — the swatch colour stands in. */}
      <div
        className="mx-6 h-[221px] rounded-lg"
        style={{ backgroundColor: variant.swatch_hex ?? "#EDF3EF" }}
      />

      <div className="flex flex-col gap-4 px-6">
        <h1 className="font-heading text-3xl font-bold text-ink">{product.title}</h1>
        <p className="text-ink">
          {typeof product.specs?.weight === "string" ? product.specs.weight : ""}
          {product.brand ? ` · ${product.brand}` : ""}
        </p>
        <p className="text-2xl font-bold text-ink">{formatPrice(variant.price_pennies)}</p>
      </div>

      <div className="flex flex-col gap-3 px-6 text-sm text-ink-muted">
        {product.description && <p>{product.description}</p>}
        <ul className="list-disc pl-5">
          {Object.entries(SPEC_LABELS).map(([key, label]) =>
            product.specs?.[key] ? (
              <li key={key}>
                {label}: {product.specs[key]}
              </li>
            ) : null,
          )}
        </ul>
        {multiLot && (
          <p className="rounded-lg border border-sage bg-white p-3 text-ink-muted">
            Please note this colour has {variant.dye_lots.length} dye lots — ball bands may vary slightly
            between them. Don&rsquo;t mix lots within one project.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 px-6">
        <p className="text-ink">
          Colour: {variant.shade_code ? `${variant.shade_code} ` : ""}
          {variant.shade_name}
        </p>
        <div className="flex flex-wrap gap-4">
          {sortedVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-label={v.shade_name}
              onClick={() => selectVariant(v.id)}
              className="size-10 shrink-0 rounded-full"
              style={{
                backgroundColor: v.swatch_hex ?? "#EDF3EF",
                outline: v.id === variant.id ? "2px solid var(--color-ink-muted)" : "1px solid var(--color-taupe)",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-warm">
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </p>
      </div>

      <div className="flex items-center gap-4 px-6">
        <QuantityStepper qty={qty} onChange={setQty} max={Math.max(stock, 1)} />
        <button
          type="button"
          disabled={stock <= 0}
          onClick={handleAddToCart}
          className="flex-1 rounded-full bg-forest px-8 py-3 text-lg font-bold text-mist disabled:opacity-50"
        >
          {justAdded ? "Added" : "Add to Cart"}
        </button>
      </div>

      {/* Sticky bottom bar — mirrors the inline controls above. */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-mist bg-soft-white px-3 py-4">
        <p className="text-center text-ink">
          {product.title} - {variant.shade_name}
        </p>
        <div className="flex items-center gap-4">
          <QuantityStepper qty={qty} onChange={setQty} max={Math.max(stock, 1)} />
          <button
            type="button"
            disabled={stock <= 0}
            onClick={handleAddToCart}
            className="flex-1 rounded-full bg-forest px-8 py-3 text-lg font-bold text-mist disabled:opacity-50"
          >
            {justAdded ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
