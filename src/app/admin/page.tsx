import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ data: paidOrders }, { count: productCount }] = await Promise.all([
    supabase.from("orders").select("total_pennies").eq("status", "paid"),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const revenuePennies = (paidOrders ?? []).reduce((sum, o) => sum + o.total_pennies, 0);
  const orderCount = paidOrders?.length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-sm text-ink-muted">Revenue (paid)</p>
          <p className="mt-2 text-3xl font-bold text-ink">{formatPrice(revenuePennies)}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-sm text-ink-muted">Paid orders</p>
          <p className="mt-2 text-3xl font-bold text-ink">{orderCount}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-sm text-ink-muted">Products</p>
          <p className="mt-2 text-3xl font-bold text-ink">{productCount ?? 0}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/products" className="rounded-full bg-forest px-5 py-2.5 font-bold text-mist">
          Manage Products
        </Link>
        <Link href="/admin/orders" className="rounded-full border border-taupe px-5 py-2.5 font-bold text-ink">
          View Orders
        </Link>
      </div>
    </div>
  );
}
