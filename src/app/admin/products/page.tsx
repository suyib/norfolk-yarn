import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, handle, title, brand, status, variants(id, dye_lots(qty))")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-forest px-5 py-2.5 font-bold text-mist">
          New Product
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-mist text-sm text-ink-muted">
            <th className="py-2">Title</th>
            <th className="py-2">Brand</th>
            <th className="py-2">Status</th>
            <th className="py-2">Variants</th>
            <th className="py-2">Total stock</th>
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((product) => {
            const totalStock = (product.variants ?? []).reduce(
              (sum, v) => sum + (v.dye_lots ?? []).reduce((s, dl) => s + dl.qty, 0),
              0,
            );
            return (
              <tr key={product.id} className="border-b border-mist">
                <td className="py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-bold text-ink hover:underline">
                    {product.title}
                  </Link>
                </td>
                <td className="py-3 text-ink-muted">{product.brand}</td>
                <td className="py-3 text-ink-muted">{product.status}</td>
                <td className="py-3 text-ink-muted">{product.variants?.length ?? 0}</td>
                <td className="py-3 text-ink-muted">{totalStock}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {(products ?? []).length === 0 && <p className="text-ink-muted">No products yet.</p>}
    </div>
  );
}
