import Stripe from "stripe";

// Server-only. Never import this file from a Client Component.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});
