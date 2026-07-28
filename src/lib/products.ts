import { createClient } from "@/lib/supabase/server";
import type { ProductWithVariants } from "@/lib/product-types";

const PRODUCT_SELECT =
  "id, handle, title, brand, description, specs, variants(id, shade_name, shade_code, sku, price_pennies, swatch_hex, position, dye_lots(id, lot_code, qty, note))";

export async function getAllProducts(): Promise<ProductWithVariants[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (data as unknown as ProductWithVariants[]) ?? [];
}

export async function getProductByHandle(handle: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("handle", handle)
    .eq("status", "active")
    .single();

  return (data as unknown as ProductWithVariants) ?? null;
}
