import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-mist px-8 py-4">
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="font-heading text-lg font-bold text-forest">
            Norfolk Yarn Admin
          </Link>
          <Link href="/admin/products" className="text-ink-muted hover:text-ink">
            Products
          </Link>
          <Link href="/admin/orders" className="text-ink-muted hover:text-ink">
            Orders
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <p className="text-sm text-ink-muted">{userData.user.email}</p>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
