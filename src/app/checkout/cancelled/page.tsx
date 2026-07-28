import Link from "next/link";

export default function CheckoutCancelledPage() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="font-heading text-2xl font-bold text-ink">Checkout cancelled</h1>
      <p className="text-ink-muted">No payment was taken — your basket is still waiting for you.</p>
      <Link href="/cart" className="rounded-full bg-forest px-5 py-2.5 font-bold text-mist">
        Back to Basket
      </Link>
    </div>
  );
}
