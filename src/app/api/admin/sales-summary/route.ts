import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("total_pennies").eq("status", "paid");

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  const orderCount = data.length;
  const revenuePennies = data.reduce((sum, o) => sum + o.total_pennies, 0);

  return NextResponse.json({ orderCount, revenuePennies });
}
