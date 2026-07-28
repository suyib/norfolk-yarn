import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// No admin check here — RLS's is_admin() (0002_rls.sql) is the actual gate.
// A non-admin/anon caller gets a permission-denied error from Postgres.
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, handle, title, brand, status, category_id, variants(id, shade_name, sku, price_pennies, status, dye_lots(id, lot_code, qty))",
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ products: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      handle: body.handle,
      title: body.title,
      brand: body.brand,
      description: body.description,
      specs: body.specs ?? {},
      status: body.status ?? "draft",
      category_id: body.categoryId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ product: data }, { status: 201 });
}
