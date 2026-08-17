import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";

type WishlistContextType = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync / load wishlist on user change or initial mount
  useEffect(() => {
    let isCancelled = false;

    const loadWishlist = async () => {
      if (user) {
        // User logged in: fetch wishlist from backend database
        try {
          // Check if guest wishlist items exist in localStorage to sync
          const guestRaw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
          let guestIds: string[] = [];
          if (guestRaw) {
            try {
              guestIds = JSON.parse(guestRaw);
            } catch (e) {}
          }

          // If guest wishlist items exist, sync each item to backend DB
          if (guestIds.length > 0) {
            for (const pid of guestIds) {
              try {
                await api.post("/wishlist", { productId: pid });
              } catch (err) {
                // Ignore duplicates or sync errors
              }
            }
            localStorage.removeItem(STORAGE_KEYS.WISHLIST);
          }

          // Now fetch user's full wishlist from backend DB
          const res = await api.get("/wishlist", { params: { limit: 100 } });
          const resData = res.data?.data || res.data;
          const itemsList = resData?.items || (Array.isArray(resData) ? resData : []);

          if (!isCancelled) {
            const fetchedIds = itemsList.map((item: any) => item.productId || item.product?.id || item.id).filter(Boolean);
            setIds(fetchedIds);
          }
        } catch (err) {
          console.warn("Failed to fetch user wishlist from backend:", err);
        }
      } else {
        // Guest user: load from localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
          if (raw) setIds(JSON.parse(raw));
          else setIds([]);
        } catch (e) {
          setIds([]);
        }
      }
      setIsLoaded(true);
    };

    loadWishlist();

    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // Persist guest wishlist to localStorage when user is not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [ids, isLoaded, user]);

  const toggle = async (id: string) => {
    const isCurrentlyIn = ids.includes(id);

    // Optimistically update local UI state
    setIds((prev) =>
      isCurrentlyIn ? prev.filter((x) => x !== id) : [...prev, id]
    );

    if (user) {
      try {
        if (isCurrentlyIn) {
          await api.delete(`/wishlist/${id}`);
        } else {
          await api.post("/wishlist", { productId: id });
        }
      } catch (err) {
        console.warn("Backend wishlist toggle error:", err);
      }
    }
  };

  const wishlist: WishlistContextType = {
    ids,
    toggle,
    has: (id) => ids.includes(id),
    count: ids.length,
  };

  return <WishlistContext.Provider value={wishlist}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
