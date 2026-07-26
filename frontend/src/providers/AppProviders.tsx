import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";
import { CartProvider } from "@/store/cart.store";
import { WishlistProvider } from "@/store/wishlist.store";

/**
 * Combines all providers into a single wrapper.
 * Order matters: QueryProvider → AuthProvider → CartProvider → WishlistProvider
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
