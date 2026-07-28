import { createClient } from "@/lib/supabase/server";
import { NewProductClient } from "./new-product-client";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("position");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-ink">New Product</h1>
      <NewProductClient categories={categories ?? []} />
    </div>
  );
}
