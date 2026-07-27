import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// Marks an order paid and decrements the specific dye lots its order_items
// were allocated at checkout. Idempotent on order.status — Stripe redelivers
// webhooks, and this must not double-decrement stock on a replay.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in session metadata" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: order } = await supabase.from("orders").select("id, status").eq("id", orderId).single();

    if (order && order.status === "pending") {
      const { data: items } = await supabase
        .from("order_items")
        .select("dye_lot_id, qty")
        .eq("order_id", orderId);

      for (const item of items ?? []) {
        if (!item.dye_lot_id) continue;

        const { data: lot } = await supabase
          .from("dye_lots")
          .select("qty")
          .eq("id", item.dye_lot_id)
          .single();

        if (lot) {
          await supabase
            .from("dye_lots")
            .update({ qty: Math.max(lot.qty - item.qty, 0) })
            .eq("id", item.dye_lot_id);
        }
      }

      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

      await supabase
        .from("orders")
        .update({ status: "paid", stripe_payment_intent: paymentIntentId })
        .eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
