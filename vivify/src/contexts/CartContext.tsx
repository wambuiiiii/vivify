import { createContext, useContext, useState, useEffect } from "react";
// Import the ReactNode type directly to fix the Vite TS1484 error
import type { ReactNode } from "react";

// We define what a Variant looks like here so we don't rely on the old static file
export interface Variant {
  id: number | string;
  color: string;
  image: string;
  swatch: string;
  stock: number;
}

export type CartItem = {
  productId: string;
  variantId: string;
  qty: number;
  // NEW: We now store the exact Django details right in the cart!
  name: string;
  price: number;
  variant: Variant;
};

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  // Updated add function to accept the full product details
  add: (productId: string, variantId: string, name: string, price: number, variant: Variant) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  // Detailed is now just the items array directly!
  detailed: CartItem[];
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage so it survives the Google redirect
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem("vivify_cart");
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  // Save to localStorage whenever the cart items change
  useEffect(() => {
    localStorage.setItem("vivify_cart", JSON.stringify(items));
  }, [items]);

  // When adding, we save the full Django details directly into the state
  const add = (productId: string, variantId: string, name: string, price: number, variant: Variant) => {
    setItems((prev) => {
      const found = prev.find((i) => i.variantId === variantId);
      if (found) {
        return prev.map((i) => (i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId, variantId, qty: 1, name, price, variant }];
    });
    setOpen(true);
  };

  const remove = (variantId: string) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const setQty = (variantId: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i))
    );

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ items, open, setOpen, add, remove, setQty, clear, count, subtotal, detailed: items }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};