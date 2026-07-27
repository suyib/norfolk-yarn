import Stripe from "stripe";

// Server-only. Never import this file from a Client Component.
//
// Lazily constructed: Next's build-time page-data collection imports every
// route module, and constructing Stripe eagerly with a missing/placeholder
// key would crash the build before any request happens. The Proxy defers
// construction (and the apiKey check) until a route handler actually uses it.
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});
