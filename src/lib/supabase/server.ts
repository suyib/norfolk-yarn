import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Anon-scoped client for server components / route handlers — respects RLS.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — a middleware refreshing
            // the session covers this. Safe to ignore here.
          }
        },
      },
    },
  );
}
