import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut, testAdminWrite } from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ testResult?: string; testError?: string }>;
}) {
  const { testResult, testError } = await searchParams;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/login?error=Signed+in,+but+that+account+isn't+an+admin");
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="text-2xl font-semibold text-forest">Admin</h1>
      <p className="mt-1 text-sm text-heather">Signed in as {userData.user.email}</p>

      <form action={testAdminWrite} className="mt-6">
        <Button type="submit" variant="secondary">
          Test admin write (is_admin() check)
        </Button>
      </form>
      {testResult === "ok" && (
        <p className="mt-2 text-sm text-forest">Write succeeded — is_admin() let it through.</p>
      )}
      {testError && <p className="mt-2 text-sm text-destructive">Write rejected: {testError}</p>}

      <form action={signOut} className="mt-4">
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  );
}
