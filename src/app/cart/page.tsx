"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, type CartLineItem } from "@/components/cart/cart-context";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatPrice } from "@/lib/format";

function CartLine({
  item,
  onQtyChange,
  onRemove,
  secondaryAction,
}: {
  item: CartLineItem;
  onQtyChange?: (qty: number) => void;
  onRemove: () => void;
  secondaryAction: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex gap-4 border-b border-mist py-4">
      <div
        className="size-16 shrink-0 rounded-lg"
        style={{ backgroundColor: item.swatchHex ?? "#EDF3EF" }}
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-2">
          <div>
            <p className="font-bold tracking-wide text-ink">{item.productTitle}</p>
            <p className="text-sm text-ink-muted">{item.shadeName}</p>
          </div>
          <p className="font-bold text-ink">{formatPrice(item.pricePennies * item.qty)}</p>
        </div>
        <div className="flex items-center gap-4">
          {onQtyChange ? (
            <QuantityStepper qty={item.qty} onChange={onQtyChange} min={1} />
          ) : (
            <p className="text-sm text-ink-muted">Qty: {item.qty}</p>
          )}
          <button type="button" onClick={secondaryAction.onClick} className="text-sm underline text-ink-muted">
            {secondaryAction.label}
          </button>
          <button type="button" onClick={onRemove} className="text-sm underline text-muted-warm">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, savedForLater, updateQty, removeItem, saveForLater, moveToCart, removeSaved } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const subtotalPennies = items.reduce((sum, i) => sum + i.pricePennies * i.qty, 0);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? "Could not start checkout.");
        setCheckingOut(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Could not reach checkout — check your connection and try again.");
      setCheckingOut(false);
    }
  };

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">Your basket is empty</h1>
        <Link href="/shop" className="rounded-full bg-forest px-5 py-2.5 font-bold text-mist">
          Shop Yarn
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-6">
      <h1 className="font-heading text-3xl font-bold text-ink">Your Basket</h1>

      {items.length > 0 && (
        <section className="flex flex-col">
          {items.map((item) => (
            <CartLine
              key={item.variantId}
              item={item}
              onQtyChange={(qty) => updateQty(item.variantId, qty)}
              onRemove={() => removeItem(item.variantId)}
              secondaryAction={{ label: "Save for later", onClick: () => saveForLater(item.variantId) }}
            />
          ))}

          <div className="flex justify-between pt-4">
            <p className="font-bold text-ink">Subtotal</p>
            <p className="font-bold text-ink">{formatPrice(subtotalPennies)}</p>
          </div>

          {checkoutError && <p className="text-sm text-destructive">{checkoutError}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkingOut}
            className="mt-4 rounded-full bg-forest px-8 py-3 text-lg font-bold text-mist disabled:opacity-50"
          >
            {checkingOut ? "Redirecting to checkout…" : "Checkout"}
          </button>
        </section>
      )}

      {savedForLater.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-mist pt-6">
          <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Saved for later</h2>
          {savedForLater.map((item) => (
            <CartLine
              key={item.variantId}
              item={item}
              onRemove={() => removeSaved(item.variantId)}
              secondaryAction={{ label: "Move to basket", onClick: () => moveToCart(item.variantId) }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
