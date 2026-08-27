import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/store/cart.store";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

export default function CartPage() {
  const router = useRouter();
  const { items, setQty, remove } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Automatically select all items on load or when new items are added
  useEffect(() => {
    if (items.length > 0) {
      setSelectedIds((prev) => {
        const itemIds = items.map((i) => i.id);
        const newSelected = Array.from(new Set([...prev.filter((id) => itemIds.includes(id)), ...itemIds]));
        return newSelected;
      });
    } else {
      setSelectedIds([]);
    }
  }, [items]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const selectedItems = useMemo(() => {
    return items.filter((i) => selectedIds.includes(i.id));
  }, [items, selectedIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [selectedItems]);

  const shipping: number = 0;
  const total = selectedSubtotal + shipping;

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    sessionStorage.setItem("voltra_selected_checkout_items", JSON.stringify(selectedItems));
    router.push(ROUTES.CUSTOMER_CHECKOUT);
  };

  return (
    <>
      <Head>
        <title>Cart — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <h1 className="font-display text-3xl font-bold text-ink">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="glass mt-6 p-10 text-center rounded-3xl">
            <ShoppingBag className="mx-auto text-ink-soft" size={40} />
            <p className="mt-3 text-sm text-ink-soft">Your cart is empty.</p>
            <Link href={ROUTES.CATEGORIES} className="btn-neon mt-4 inline-flex px-5 py-2.5 text-sm font-bold">
              Shop now
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {/* Select All Checkbox Header */}
              <div className="glass flex items-center justify-between p-4 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-extrabold text-ink uppercase tracking-wide">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 rounded-lg border-ink/20 accent-[#CCFF00] cursor-pointer"
                  />
                  <span>Select All Items ({selectedIds.length} of {items.length} selected)</span>
                </label>

                {selectedIds.length < items.length && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-500/10 px-3 py-1 rounded-full">
                    Only selected items will checkout
                  </span>
                )}
              </div>

              {/* Cart Items List */}
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`glass flex items-center gap-4 p-5 rounded-3xl transition ${
                      isSelected ? "border-neon/40 ring-1 ring-neon/20 bg-white/80" : "opacity-75 bg-white/40"
                    }`}
                  >
                    {/* Checkbox at the starting of item */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="h-5 w-5 rounded-lg border-ink/20 accent-[#CCFF00] cursor-pointer shrink-0"
                    />

                    <div
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-slate-100 shadow-sm"
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover scale-105" />
                    </div>

                    <div className="flex-1">
                      <div className="font-display text-base font-semibold text-ink">{item.name}</div>
                      <div className="text-xs text-ink-soft mt-0.5">{item.category}</div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 shadow-sm border border-ink/5">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-slate-100"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-ink text-white shadow-sm hover:bg-ink/80"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="w-24 text-right font-display font-bold text-ink">
                      ${(item.price * item.qty).toFixed(2)}
                    </div>

                    <button
                      onClick={() => remove(item.id)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/70 text-ink-soft hover:text-rose-500 transition shadow-sm"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Summary */}
            <aside className="glass h-fit p-6 rounded-3xl">
              <h3 className="font-display text-lg font-semibold text-ink">Order Summary</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal ({selectedItems.length} items)</dt>
                  <dd className="font-medium text-ink">${selectedSubtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="font-medium text-ink">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </dd>
                </div>
                <div className="my-3 border-t border-ink/10" />
                <div className="flex justify-between text-base">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="font-display text-xl font-bold text-ink">${total.toFixed(2)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={selectedItems.length === 0}
                className="btn-neon mt-5 inline-flex w-full items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Checkout ({selectedItems.length} selected) <ArrowRight size={16} />
              </button>

              <Link
                href={ROUTES.CATEGORIES}
                className="mt-3 block text-center text-xs text-ink-soft hover:text-ink font-semibold"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
