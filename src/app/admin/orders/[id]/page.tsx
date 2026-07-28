import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

type OrderItem = {
  id: string;
  product_title: string;
  shade_name: string | null;
  lot_code: string | null;
  qty: number;
  unit_price_pennies: number;
  line_total_pennies: number;
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).single();

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">Order #{order.order_number}</h1>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-mist bg-white p-6 sm:grid-cols-4">
        <div>
          <p className="text-sm text-ink-muted">Status</p>
          <p className="font-bold text-ink">{order.status}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Email</p>
          <p className="font-bold text-ink">{order.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Total</p>
          <p className="font-bold text-ink">{formatPrice(order.total_pennies)}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Date</p>
          <p className="font-bold text-ink">{new Date(order.created_at).toLocaleString("en-GB")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Items</h2>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-mist text-sm text-ink-muted">
              <th className="py-2">Product</th>
              <th className="py-2">Shade</th>
              <th className="py-2">Lot</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit price</th>
              <th className="py-2">Line total</th>
            </tr>
          </thead>
          <tbody>
            {((order.order_items ?? []) as OrderItem[]).map((item) => (
              <tr key={item.id} className="border-b border-mist">
                <td className="py-3 text-ink">{item.product_title}</td>
                <td className="py-3 text-ink-muted">{item.shade_name}</td>
                <td className="py-3 text-ink-muted">{item.lot_code ?? "—"}</td>
                <td className="py-3 text-ink-muted">{item.qty}</td>
                <td className="py-3 text-ink-muted">{formatPrice(item.unit_price_pennies)}</td>
                <td className="py-3 text-ink-muted">{formatPrice(item.line_total_pennies)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
