import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — Voltra" }] }),
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
      <h1 className="font-display text-3xl font-bold text-ink">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="glass mt-6 p-10 text-center">
          <ShoppingBag className="mx-auto text-ink-soft" />
          <p className="mt-3 text-ink-soft">Your cart is empty.</p>
          <Link to="/categories" className="btn-neon mt-4 inline-flex px-5 py-2 text-sm">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="glass flex items-center gap-4 p-5">
                <div
                  className="grid h-20 w-20 place-items-center rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)` }}
                >
                  <img src={item.image} alt={item.name} className="h-14 w-14 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base font-semibold text-ink">{item.name}</div>
                  <div className="text-xs text-ink-soft">{item.category}</div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/70 p-1">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="w-20 text-right font-display font-bold text-ink">
                  ${item.price * item.qty}
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-ink-soft hover:text-rose-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <aside className="glass h-fit p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Order Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="font-medium text-ink">${subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="font-medium text-ink">{shipping === 0 ? "Free" : `$${shipping}`}</dd>
              </div>
              <div className="my-3 border-t border-ink/10" />
              <div className="flex justify-between text-base">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-xl font-bold text-ink">${total}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="btn-neon mt-5 inline-flex w-full items-center justify-center py-3 text-sm"
            >
              Checkout
            </Link>
            <Link to="/categories" className="mt-3 block text-center text-xs text-ink-soft hover:text-ink">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
