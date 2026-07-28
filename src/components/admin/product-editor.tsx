"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ProductFieldsForm, type ProductFieldsValues } from "@/components/admin/product-fields-form";

type DyeLot = { id: string; lot_code: string; qty: number; note: string | null };

type Variant = {
  id: string;
  shade_name: string;
  shade_code: string | null;
  sku: string | null;
  price_pennies: number;
  swatch_hex: string | null;
  image_url: string | null;
  position: number;
  status: "active" | "archived";
  dye_lots: DyeLot[];
};

type Product = {
  id: string;
  handle: string;
  title: string;
  brand: string | null;
  description: string | null;
  specs: Record<string, string>;
  status: "draft" | "active" | "archived";
  category_id: string | null;
  variants: Variant[];
};

export function ProductEditor({
  product,
  categories,
}: {
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();

  const handleProductSubmit = async (values: ProductFieldsValues) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, categoryId: values.categoryId || null }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "Could not save product" };
    router.refresh();
  };

  const handleDeleteProduct = async () => {
    if (!confirm(`Delete "${product.title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/products");
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">{product.title}</h1>
        <Button variant="destructive" onClick={handleDeleteProduct}>
          Delete Product
        </Button>
      </div>

      <ProductFieldsForm
        submitLabel="Save Product"
        categories={categories}
        initialValues={{
          handle: product.handle,
          title: product.title,
          brand: product.brand ?? "",
          description: product.description ?? "",
          status: product.status,
          categoryId: product.category_id ?? "",
          specs: {
            weight: product.specs?.weight ?? "",
            needle_size: product.specs?.needle_size ?? "",
            tension: product.specs?.tension ?? "",
            meterage: product.specs?.meterage ?? "",
            composition: product.specs?.composition ?? "",
            wash_care: product.specs?.wash_care ?? "",
          },
        }}
        onSubmit={handleProductSubmit}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-ink">Variants</h2>
        {product.variants
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((variant) => (
            <VariantRow key={variant.id} productId={product.id} variant={variant} />
          ))}
        <AddVariantForm productId={product.id} nextPosition={product.variants.length} />
      </div>
    </div>
  );
}

function VariantRow({ productId, variant }: { productId: string; variant: Variant }) {
  const router = useRouter();
  const [priceInput, setPriceInput] = useState((variant.price_pennies / 100).toFixed(2));
  const [status, setStatus] = useState(variant.status);
  const [uploading, setUploading] = useState(false);
  const [showLots, setShowLots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stock = variant.dye_lots.reduce((s, l) => s + l.qty, 0);

  const saveVariant = async () => {
    setError(null);
    const res = await fetch(`/api/admin/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricePennies: Math.round(parseFloat(priceInput) * 100), status }),
    });
    if (res.ok) router.refresh();
    else setError((await res.json()).error ?? "Could not save variant");
  };

  const deleteVariant = async () => {
    if (!confirm(`Delete ${variant.shade_name}?`)) return;
    const res = await fetch(`/api/admin/variants/${variant.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else setError((await res.json()).error ?? "Could not delete variant");
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const path = `${productId}/${variant.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    await fetch(`/api/admin/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: data.publicUrl }),
    });
    setUploading(false);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="size-10 shrink-0 rounded-full"
          style={{ backgroundColor: variant.swatch_hex ?? "#EDF3EF" }}
        />
        <div className="min-w-[160px] flex-1">
          <p className="font-bold text-ink">
            {variant.shade_name} {variant.shade_code ? `(${variant.shade_code})` : ""}
          </p>
          <p className="text-sm text-ink-muted">
            SKU: {variant.sku ?? "—"} · {stock} in stock across {variant.dye_lots.length} lot
            {variant.dye_lots.length === 1 ? "" : "s"}
          </p>
        </div>
        <Input
          className="w-24"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          aria-label="Price"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Variant["status"])}
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button size="sm" onClick={saveVariant}>
          Save
        </Button>
        <label className="cursor-pointer text-sm text-ink-muted underline">
          {uploading ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </label>
        <button type="button" onClick={() => setShowLots((s) => !s)} className="text-sm text-ink-muted underline">
          {showLots ? "Hide dye lots" : "Dye lots"}
        </button>
        <Button size="sm" variant="destructive" onClick={deleteVariant}>
          Delete
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {showLots && (
        <div className="mt-4 flex flex-col gap-2 border-t border-mist pt-4">
          {variant.dye_lots.map((lot) => (
            <DyeLotRow key={lot.id} lot={lot} />
          ))}
          <AddDyeLotForm variantId={variant.id} />
        </div>
      )}
    </div>
  );
}

function DyeLotRow({ lot }: { lot: DyeLot }) {
  const router = useRouter();
  const [qty, setQty] = useState(lot.qty);
  const [note, setNote] = useState(lot.note ?? "");

  const save = async () => {
    await fetch(`/api/admin/dye-lots/${lot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty, note }),
    });
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Delete lot ${lot.lot_code}?`)) return;
    await fetch(`/api/admin/dye-lots/${lot.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="w-16 text-ink-muted">Lot {lot.lot_code}</span>
      <Input
        className="w-20"
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        aria-label={`Quantity for lot ${lot.lot_code}`}
      />
      <Input
        className="flex-1"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note"
      />
      <Button size="sm" onClick={save}>
        Save
      </Button>
      <Button size="sm" variant="destructive" onClick={remove}>
        Delete
      </Button>
    </div>
  );
}

function AddDyeLotForm({ variantId }: { variantId: string }) {
  const router = useRouter();
  const [lotCode, setLotCode] = useState("");
  const [qty, setQty] = useState(0);

  const add = async () => {
    if (!lotCode) return;
    await fetch(`/api/admin/variants/${variantId}/dye-lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotCode, qty }),
    });
    setLotCode("");
    setQty(0);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <Input placeholder="Lot code" value={lotCode} onChange={(e) => setLotCode(e.target.value)} className="w-24" />
      <Input
        placeholder="Qty"
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="w-20"
      />
      <Button size="sm" variant="secondary" onClick={add}>
        Add lot
      </Button>
    </div>
  );
}

function AddVariantForm({ productId, nextPosition }: { productId: string; nextPosition: number }) {
  const router = useRouter();
  const [shadeName, setShadeName] = useState("");
  const [shadeCode, setShadeCode] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [swatchHex, setSwatchHex] = useState("#EDF3EF");
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    if (!shadeName || !price) {
      setError("Shade name and price are required.");
      return;
    }
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shadeName,
        shadeCode: shadeCode || null,
        sku: sku || null,
        pricePennies: Math.round(parseFloat(price) * 100),
        swatchHex,
        position: nextPosition,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add variant");
      return;
    }
    setShadeName("");
    setShadeCode("");
    setSku("");
    setPrice("");
    setError(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-taupe p-4">
      <p className="text-sm font-bold text-ink">Add a shade</p>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Shade name"
          value={shadeName}
          onChange={(e) => setShadeName(e.target.value)}
          className="w-40"
        />
        <Input placeholder="Code" value={shadeCode} onChange={(e) => setShadeCode(e.target.value)} className="w-20" />
        <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="w-32" />
        <Input placeholder="Price (£)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24" />
        <input
          type="color"
          value={swatchHex}
          onChange={(e) => setSwatchHex(e.target.value)}
          className="size-9 rounded"
          aria-label="Swatch colour"
        />
        <Button size="sm" onClick={add}>
          Add Variant
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
