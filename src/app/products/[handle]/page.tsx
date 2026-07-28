import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/pdp/product-detail";
import { getProductByHandle } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
