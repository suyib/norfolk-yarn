"use client";

import Link from "next/link";
import { MapPin, Search, ShoppingBag } from "iconoir-react";
import { useCart } from "@/components/cart/cart-context";
import { MobileNav } from "@/components/site/mobile-nav";

export function Header() {
  const { itemCount } = useCart();

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-cream py-2 text-center text-[13px] text-forest">Click &amp; Collect - Norwich</div>
      <header className="flex items-center justify-between bg-forest px-4 py-2">
        <div className="flex items-center gap-6">
          <MobileNav />
          <Link href="/shop" aria-label="Search the shop" className="flex size-6 items-center justify-center text-cream">
            <Search width={24} height={24} />
          </Link>
        </div>

        <Link href="/" className="font-heading text-lg italic text-cream">
          Norfolk Yarn
        </Link>

        <div className="flex items-center gap-6">
          <Link href="#" aria-label="Find our store" className="flex size-6 items-center justify-center text-cream">
            <MapPin width={24} height={24} />
          </Link>
          <Link href="/cart" aria-label="View basket" className="relative flex size-6 items-center justify-center text-cream">
            <ShoppingBag width={24} height={24} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-heather text-[10px] font-bold text-heather-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </div>
  );
}
