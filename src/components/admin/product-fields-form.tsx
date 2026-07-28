"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ProductFieldsValues = {
  handle: string;
  title: string;
  brand: string;
  description: string;
  status: "draft" | "active" | "archived";
  categoryId: string;
  specs: {
    weight: string;
    needle_size: string;
    tension: string;
    meterage: string;
    composition: string;
    wash_care: string;
  };
};

const SPEC_FIELDS: { key: keyof ProductFieldsValues["specs"]; label: string }[] = [
  { key: "weight", label: "Weight" },
  { key: "needle_size", label: "Needle size" },
  { key: "tension", label: "Tension" },
  { key: "meterage", label: "Meterage" },
  { key: "composition", label: "Composition" },
  { key: "wash_care", label: "Wash care" },
];

export function ProductFieldsForm({
  initialValues,
  categories,
  submitLabel,
  onSubmit,
}: {
  initialValues: ProductFieldsValues;
  categories: { id: string; name: string }[];
  submitLabel: string;
  onSubmit: (values: ProductFieldsValues) => Promise<{ error?: string } | void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSubmit(values);
    if (result?.error) setError(result.error);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handle">Handle (slug)</Label>
          <Input
            id="handle"
            required
            value={values.handle}
            onChange={(e) => setValues((v) => ({ ...v, handle: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={values.brand}
            onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={values.categoryId}
            onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value }))}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={values.status}
          onChange={(e) =>
            setValues((v) => ({ ...v, status: e.target.value as ProductFieldsValues["status"] }))
          }
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-mist p-4">
        <legend className="px-1 text-sm font-bold text-ink">Specs</legend>
        <div className="grid grid-cols-2 gap-4">
          {SPEC_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={values.specs[key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, specs: { ...v.specs, [key]: e.target.value } }))
                }
              />
            </div>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
