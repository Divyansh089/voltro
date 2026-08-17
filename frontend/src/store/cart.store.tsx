import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";

// ── Types ──
export type CartProduct = {
  id: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  color?: string;
  rating?: number;
  reviews?: number;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync / load cart on user change or initial mount
  useEffect(() => {
    let isCancelled = false;

    const loadCart = async () => {
      if (user) {
        // User logged in: fetch cart from backend database
        try {
          // Check if guest items exist in localStorage to sync to DB
          const guestRaw = localStorage.getItem(STORAGE_KEYS.CART);
          let guestItems: CartItem[] = [];
          if (guestRaw) {
            try {
              guestItems = JSON.parse(guestRaw);
            } catch (e) {}
          }

          // If guest items exist, attempt to push them to backend cart
          if (guestItems.length > 0) {
            for (const item of guestItems) {
              if (item.variantId) {
                try {
                  await api.post("/cart/items", {
                    variantId: item.variantId,
                    quantity: item.qty,
                  });
                } catch (err) {
                  // Ignore individual variant sync errors
                }
              }
            }
            // Clear local guest cart storage after sync
            localStorage.removeItem(STORAGE_KEYS.CART);
          }

          // Now fetch user's full cart from backend DB
          const res = await api.get("/cart");
          const backendCart = res.data?.data || res.data;

          if (!isCancelled && backendCart?.items) {
            const mappedItems: CartItem[] = backendCart.items.map((i: any) => ({
              id: i.id,
              variantId: i.variantId,
              name: i.variant?.product?.name || i.variant?.name || "Product",
              price: Number(i.price || 0),
              image:
                i.variant?.product?.images?.[0]?.url ||
                i.variant?.product?.images?.[0]?.imageUrl ||
                "/placeholder.png",
              category: i.variant?.product?.category || "Gadgets",
              color: i.variant?.color || "#0F172A",
              rating: 5,
              reviews: 0,
              qty: i.quantity,
            }));
            setItems(mappedItems);
          }
        } catch (err) {
          console.warn("Failed to fetch user cart from backend:", err);
        }
      } else {
        // Guest user: load from localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.CART);
          if (raw) setItems(JSON.parse(raw));
          else setItems([]);
        } catch (e) {
          setItems([]);
        }
      }
      setIsLoaded(true);
    };

    loadCart();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // Persist guest cart to localStorage when user is not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [items, isLoaded, user]);

  const add = async (p: CartProduct, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === p.id || (p.variantId && i.variantId === p.variantId));
      if (ex) {
        return prev.map((i) =>
          i.id === p.id || (p.variantId && i.variantId === p.variantId)
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, { ...p, qty }];
    });

    if (user && p.variantId) {
      try {
        await api.post("/cart/items", {
          variantId: p.variantId,
          quantity: qty,
        });
      } catch (err) {
        console.warn("Backend add cart error:", err);
      }
    }
  };

  const remove = async (id: string) => {
    const targetItem = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (user && targetItem) {
      try {
        await api.delete(`/cart/items/${id}`);
      } catch (err) {
        console.warn("Backend remove cart item error:", err);
      }
    }
  };

  const setQty = async (id: string, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: validQty } : i))
    );

    if (user) {
      try {
        await api.patch(`/cart/items/${id}`, { quantity: validQty });
      } catch (err) {
        console.warn("Backend update cart qty error:", err);
      }
    }
  };

  const clear = async () => {
    setItems([]);
    if (user) {
      try {
        await api.delete("/cart");
      } catch (err) {
        console.warn("Backend clear cart error:", err);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART);
    }
  };

  const cart: CartContextType = {
    items,
    add,
    remove,
    setQty,
    clear,
    subtotal: items.reduce((t, i) => t + i.price * i.qty, 0),
    count: items.reduce((t, i) => t + i.qty, 0),
  };

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
