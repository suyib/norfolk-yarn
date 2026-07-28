"use client";

import { useRouter } from "next/navigation";
import { ProductFieldsForm, type ProductFieldsValues } from "@/components/admin/product-fields-form";

export function NewProductClient({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();

  const handleSubmit = async (values: ProductFieldsValues) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: values.handle,
        title: values.title,
        brand: values.brand,
        description: values.description,
        status: values.status,
        categoryId: values.categoryId || null,
        specs: values.specs,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Could not create product" };
    router.push(`/admin/products/${data.product.id}`);
  };

  return (
    <ProductFieldsForm
      submitLabel="Create Product"
      categories={categories}
      initialValues={{
        handle: "",
        title: "",
        brand: "",
        description: "",
        status: "draft",
        categoryId: categories[0]?.id ?? "",
        specs: { weight: "", needle_size: "", tension: "", meterage: "", composition: "", wash_care: "" },
      }}
      onSubmit={handleSubmit}
    />
  );
}
