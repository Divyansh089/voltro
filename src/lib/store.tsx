import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./data";

/* ---------------- Auth ---------------- */
type User = { name: string; email: string };
type AuthCtx = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
};
const AuthContext = createContext<AuthCtx | null>(null);

/* ---------------- Cart ---------------- */
export type CartItem = Product & { qty: number };
type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};
const CartContext = createContext<CartCtx | null>(null);

/* ---------------- Wishlist ---------------- */
type WishCtx = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
};
const WishContext = createContext<WishCtx | null>(null);

/* ---------------- Provider ---------------- */
function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocal<User | null>("voltra.user", null);
  const [items, setItems] = useLocal<CartItem[]>("voltra.cart", []);
  const [ids, setIds] = useLocal<string[]>("voltra.wishlist", []);

  const auth: AuthCtx = {
    user,
    login: (email, name) =>
      setUser({ email, name: name || email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()) }),
    logout: () => setUser(null),
  };

  const cart: CartCtx = {
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

  const wish: WishCtx = {
    ids,
    toggle: (id) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    has: (id) => ids.includes(id),
    count: ids.length,
  };

  return (
    <AuthContext.Provider value={auth}>
      <CartContext.Provider value={cart}>
        <WishContext.Provider value={wish}>{children}</WishContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(AuthContext);
  if (!v) throw new Error("AuthContext missing");
  return v;
};
export const useCart = () => {
  const v = useContext(CartContext);
  if (!v) throw new Error("CartContext missing");
  return v;
};
export const useWishlist = () => {
  const v = useContext(WishContext);
  if (!v) throw new Error("WishContext missing");
  return v;
};
