"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Xmark } from "iconoir-react";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop Yarn", href: "/shop" },
  { label: "Accessories", href: "#" },
  { label: "Brands", href: "#" },
  { label: "Workshops", href: "#" },
  { label: "Sale", href: "#" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex size-6 items-center justify-center text-cream"
      >
        <Menu width={24} height={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-full max-w-[300px] bg-forest text-cream flex flex-col">
            <div className="flex justify-end px-4 pt-4">
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                <Xmark width={24} height={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4 px-6 pt-4">
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-sans font-bold uppercase tracking-wide text-cream"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4 px-6 py-8 text-sm text-cream">
              <div className="flex flex-col gap-2">
                <Link href="#">About Us</Link>
                <Link href="#">Contact Us</Link>
              </div>
              <div className="flex flex-col gap-1">
                <p>01603 927034</p>
                <p>11 Pottergate, Norwich NR2 1DS</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}
    </>
  );
}
