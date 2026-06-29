import Head from "next/head";
import Link from "next/link";
import { Heart, Trash2, ArrowUpRight } from "lucide-react";
import { useWishlist, useCart } from "@/lib/store";
import { findProduct } from "@/lib/data";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const cart = useCart();
  const items = ids.map(findProduct).filter(Boolean) as NonNullable<ReturnType<typeof findProduct>>[];

  return (
    <>
      <Head>
        <title>Wishlist — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <div className="flex items-center gap-3">
          <Heart className="text-rose-500" />
          <h1 className="font-display text-3xl font-bold text-ink">Your Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="glass mt-6 p-10 text-center">
            <p className="text-ink-soft">No items yet. Tap the heart on any product to save it.</p>
            <Link href="/categories" className="btn-neon mt-4 inline-flex px-5 py-2 text-sm">
              Discover products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {items.map((p) => (
              <div key={p.id} className="glass flex flex-col p-4">
                <div
                  className="grid h-36 place-items-center overflow-hidden rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${p.color}25, ${p.color}05)` }}
                >
                  <img src={p.image} alt={p.name} className="h-28 w-28 object-contain drop-shadow-xl" />
                </div>
                <div className="mt-3 text-sm font-semibold text-ink">{p.name}</div>
                <div className="font-display text-base font-bold text-ink">${p.price}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => cart.add(p)} className="btn-neon flex-1 py-2 text-xs">
                    Add to cart
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-ink-soft hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link
                    href={`/product/${p.id}`}
                    className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
