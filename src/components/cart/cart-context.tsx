"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export type CartLineItem = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  shadeName: string;
  swatchHex: string | null;
  pricePennies: number;
  qty: number;
};

type CartState = {
  items: CartLineItem[];
  savedForLater: CartLineItem[];
};

type CartContextValue = CartState & {
  itemCount: number;
  addItem: (item: Omit<CartLineItem, "qty">, qty?: number) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  saveForLater: (variantId: string) => void;
  moveToCart: (variantId: string) => void;
  removeSaved: (variantId: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "norfolk-yarn-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartLineItem[]>([]);
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount — server and first client render
  // stay empty so there's no hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        setItems(parsed.items ?? []);
        setSavedForLater(parsed.savedForLater ?? []);
      }
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, savedForLater }));
  }, [items, savedForLater]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) => (i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (variantId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.variantId !== variantId) : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i)),
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const saveForLater = (variantId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.variantId === variantId);
      if (!item) return prev;
      setSavedForLater((saved) =>
        saved.some((i) => i.variantId === variantId) ? saved : [...saved, item],
      );
      return prev.filter((i) => i.variantId !== variantId);
    });
  };

  const moveToCart = (variantId: string) => {
    setSavedForLater((prev) => {
      const item = prev.find((i) => i.variantId === variantId);
      if (!item) return prev;
      setItems((cart) =>
        cart.some((i) => i.variantId === variantId)
          ? cart.map((i) => (i.variantId === variantId ? { ...i, qty: i.qty + item.qty } : i))
          : [...cart, item],
      );
      return prev.filter((i) => i.variantId !== variantId);
    });
  };

  const removeSaved = (variantId: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedForLater,
        itemCount,
        addItem,
        updateQty,
        removeItem,
        saveForLater,
        moveToCart,
        removeSaved,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
