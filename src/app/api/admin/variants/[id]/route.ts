import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("variants")
    .update({
      ...(body.shadeName !== undefined && { shade_name: body.shadeName }),
      ...(body.shadeCode !== undefined && { shade_code: body.shadeCode }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.pricePennies !== undefined && { price_pennies: body.pricePennies }),
      ...(body.swatchHex !== undefined && { swatch_hex: body.swatchHex }),
      ...(body.imageUrl !== undefined && { image_url: body.imageUrl }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.status !== undefined && { status: body.status }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ variant: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("variants").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}
