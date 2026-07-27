import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

type CheckoutItem = { variantId: string; qty: number };

type VariantRow = {
  id: string;
  shade_name: string;
  sku: string | null;
  price_pennies: number;
  product: { title: string } | null;
  dye_lots: { id: string; lot_code: string; qty: number }[];
};

// Creates a pending order + order_items (allocating one dye lot per line —
// no cross-lot splitting yet) and a matching Stripe Checkout Session.
// The webhook flips the order to "paid" and decrements the allocated lots
// once Stripe confirms payment.
export async function POST(request: NextRequest) {
  const { items, email } = (await request.json()) as { items: CheckoutItem[]; email?: string };

  if (!items?.length) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const lines: {
    variantId: string;
    dyeLotId: string;
    qty: number;
    unitPricePennies: number;
    productTitle: string;
    shadeName: string;
    sku: string | null;
    lotCode: string;
  }[] = [];

  for (const item of items) {
    const { data: variant, error: variantError } = await supabase
      .from("variants")
      .select("id, shade_name, sku, price_pennies, product:products(title), dye_lots(id, lot_code, qty)")
      .eq("id", item.variantId)
      .single();

    if (variantError || !variant) {
      return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 404 });
    }
    const v = variant as unknown as VariantRow;

    const lot = v.dye_lots.filter((l) => l.qty >= item.qty).sort((a, b) => b.qty - a.qty)[0];

    if (!lot) {
      return NextResponse.json(
        { error: `Not enough stock in a single dye lot for ${v.shade_name}` },
        { status: 409 },
      );
    }

    lines.push({
      variantId: v.id,
      dyeLotId: lot.id,
      qty: item.qty,
      unitPricePennies: v.price_pennies,
      productTitle: v.product?.title ?? "Norfolk Yarn",
      shadeName: v.shade_name,
      sku: v.sku,
      lotCode: lot.lot_code,
    });
  }

  const subtotalPennies = lines.reduce((sum, l) => sum + l.unitPricePennies * l.qty, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ email, subtotal_pennies: subtotalPennies, total_pennies: subtotalPennies })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      variant_id: l.variantId,
      dye_lot_id: l.dyeLotId,
      product_title: l.productTitle,
      shade_name: l.shadeName,
      sku: l.sku,
      lot_code: l.lotCode,
      qty: l.qty,
      unit_price_pennies: l.unitPricePennies,
      line_total_pennies: l.unitPricePennies * l.qty,
    })),
  );

  if (itemsError) {
    return NextResponse.json({ error: "Could not create order items" }, { status: 500 });
  }

  const siteUrl = process.env.SITE_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "gbp",
        unit_amount: l.unitPricePennies,
        product_data: { name: `${l.productTitle} — ${l.shadeName}` },
      },
    })),
    success_url: `${siteUrl}/checkout/success?order=${order.id}`,
    cancel_url: `${siteUrl}/checkout/cancelled?order=${order.id}`,
    metadata: { orderId: order.id },
  });

  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ url: session.url });
}
