import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, email, status, total_pennies, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Orders</h1>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-mist text-sm text-ink-muted">
            <th className="py-2">Order</th>
            <th className="py-2">Email</th>
            <th className="py-2">Status</th>
            <th className="py-2">Total</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {(orders ?? []).map((order) => (
            <tr key={order.id} className="border-b border-mist">
              <td className="py-3">
                <Link href={`/admin/orders/${order.id}`} className="font-bold text-ink hover:underline">
                  #{order.order_number}
                </Link>
              </td>
              <td className="py-3 text-ink-muted">{order.email ?? "—"}</td>
              <td className="py-3 text-ink-muted">{order.status}</td>
              <td className="py-3 text-ink-muted">{formatPrice(order.total_pennies)}</td>
              <td className="py-3 text-ink-muted">{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {(orders ?? []).length === 0 && <p className="text-ink-muted">No orders yet.</p>}
    </div>
  );
}
