"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // Only ever needs to run once, on landing here after a successful payment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">Thank you!</h1>
      <p className="text-ink-muted">
        {orderId ? `Order #${orderId.slice(0, 8)} is confirmed.` : "Your order is confirmed."} We&rsquo;ll get
        it ready for you.
      </p>
      <Link href="/shop" className="rounded-full bg-forest px-5 py-2.5 font-bold text-mist">
        Keep Shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
