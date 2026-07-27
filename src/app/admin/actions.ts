"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Proves is_admin() actually gates writes: a signed-in admin should be able
// to run this; a signed-in non-admin or anon session should get an RLS
// permission error instead. Idempotent — just re-sets the same value.
export async function testAdminWrite() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ position: 0 })
    .eq("handle", "rowan");

  if (error) {
    redirect(`/admin?testError=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?testResult=ok");
}
