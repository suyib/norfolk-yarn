import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, handle, title, brand, description, specs, status, category_id, variants(id, shade_name, shade_code, sku, price_pennies, swatch_hex, image_url, position, status, dye_lots(id, lot_code, qty, note))",
      )
      .eq("id", id)
      .single(),
    supabase.from("categories").select("id, name").order("position"),
  ]);

  if (!product) notFound();

  return <ProductEditor product={product} categories={categories ?? []} />;
}
