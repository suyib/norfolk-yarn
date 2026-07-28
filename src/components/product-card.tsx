import Link from "next/link";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  href: string;
  title: string;
  subtitle: string;
  pricePennies: number;
  comparePricePennies?: number;
  swatchHex?: string | null;
};

// No real product photography yet — the swatch colour stands in for an
// image rather than faking a photo. comparePricePennies is optional because
// the schema has no discount field; when it's absent the SALE badge/strike
// simply doesn't render rather than showing a fake sale.
export function ProductCard({
  href,
  title,
  subtitle,
  pricePennies,
  comparePricePennies,
  swatchHex,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="flex w-[169px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-mist bg-white py-4"
    >
      <div className="relative h-[120px] w-[160px]">
        <div
          className="absolute inset-x-0 top-[7px] h-[106px] rounded-lg"
          style={{ backgroundColor: swatchHex ?? "#EDF3EF" }}
        />
        {comparePricePennies !== undefined && (
          <span className="absolute -top-1 right-0 rounded bg-sale/15 px-2 py-1 text-xs font-bold text-sale">
            SALE
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-bold tracking-wide text-ink">{title}</p>
        <p className="text-sm text-ink">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-wide text-ink">{formatPrice(pricePennies)}</span>
        {comparePricePennies !== undefined && (
          <span className="text-muted-warm line-through">{formatPrice(comparePricePennies)}</span>
        )}
      </div>
    </Link>
  );
}
