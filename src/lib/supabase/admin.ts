import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role client — BYPASSES RLS. Server-only (route handlers, the Stripe
// webhook). Never import this from a Client Component or expose the key
// to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
