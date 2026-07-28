import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dye_lots")
    .insert({
      variant_id: id,
      lot_code: body.lotCode,
      qty: body.qty ?? 0,
      received_at: body.receivedAt,
      note: body.note,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ dyeLot: data }, { status: 201 });
}
