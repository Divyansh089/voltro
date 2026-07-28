import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";

// ── Types ──
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  color: string;
  rating: number;
  reviews: number;
  tag?: string;
};

export type CartItem = CartProduct & { qty: number };

type CartContextType = {
  items: CartItem[];
  add: (p: CartProduct, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

// ── Helpers ──
function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch (e) {
      console.warn(e);
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(e);
    }
  }, [key, value]);
  return [value, setValue] as const;
}

// ── Provider ──
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocal<CartItem[]>(STORAGE_KEYS.CART, []);

  const cart: CartContextType = {
    items,
    add: (p, qty = 1) =>
      setItems((s) => {
        const ex = s.find((i) => i.id === p.id);
        if (ex) return s.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
        return [...s, { ...p, qty }];
      }),
    remove: (id) => setItems((s) => s.filter((i) => i.id !== id)),
    setQty: (id, qty) =>
      setItems((s) => s.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    clear: () => setItems([]),
    subtotal: items.reduce((t, i) => t + i.price * i.qty, 0),
    count: items.reduce((t, i) => t + i.qty, 0),
  };

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

// ── Hook ──
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
