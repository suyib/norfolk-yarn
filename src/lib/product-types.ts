export type DyeLot = {
  id: string;
  lot_code: string;
  qty: number;
  note: string | null;
};

export type VariantWithStock = {
  id: string;
  shade_name: string;
  shade_code: string | null;
  sku: string | null;
  price_pennies: number;
  swatch_hex: string | null;
  position: number;
  dye_lots: DyeLot[];
};

export type ProductWithVariants = {
  id: string;
  handle: string;
  title: string;
  brand: string | null;
  description: string | null;
  specs: Record<string, string>;
  variants: VariantWithStock[];
};

export function variantStock(variant: VariantWithStock) {
  return variant.dye_lots.reduce((sum, lot) => sum + lot.qty, 0);
}
