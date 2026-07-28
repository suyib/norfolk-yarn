import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("variants")
    .insert({
      product_id: id,
      shade_name: body.shadeName,
      shade_code: body.shadeCode,
      sku: body.sku,
      price_pennies: body.pricePennies,
      swatch_hex: body.swatchHex,
      image_url: body.imageUrl,
      position: body.position ?? 0,
      status: body.status ?? "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ variant: data }, { status: 201 });
}
