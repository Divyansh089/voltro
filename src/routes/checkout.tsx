import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { type FormEvent } from "react";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — Voltra" }] }),
});

function Field({ label, placeholder, type = "text", required }: { label: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-white/70 px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/40"
      />
    </label>
  );
}

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 12;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const onPlace = (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    clear();
    navigate({ to: "/order-confirmation" });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
        <div className="glass p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Your cart is empty</h1>
          <p className="mt-2 text-sm text-ink-soft">Add some products before checking out.</p>
          <Link to="/categories" className="btn-neon mt-5 inline-flex px-5 py-2.5 text-sm">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onPlace} className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
      <h1 className="font-display text-3xl font-bold text-ink">Checkout</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <section className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Contact</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Email" placeholder="ryman@voltra.io" type="email" required />
              <Field label="Phone" placeholder="+1 (415) 555 0123" required />
            </div>
          </section>
          <section className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Shipping Address</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name" placeholder="Ryman Alex" required />
              <Field label="Country" placeholder="United States" required />
              <Field label="Address" placeholder="280 Mission St." required />
              <Field label="City" placeholder="San Francisco" required />
              <Field label="Postal code" placeholder="94105" required />
              <Field label="State" placeholder="California" required />
            </div>
          </section>
          <section className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Delivery method</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { name: "Standard", eta: "5–7 days", price: "Free" },
                { name: "Express", eta: "2–3 days", price: "$12" },
                { name: "Same-day", eta: "Today", price: "$28" },
              ].map((m, i) => (
                <label
                  key={m.name}
                  className="cursor-pointer rounded-2xl border border-ink/10 bg-white/60 p-4 text-sm transition has-[input:checked]:border-neon has-[input:checked]:bg-white"
                >
                  <input type="radio" name="ship" defaultChecked={i === 0} className="hidden" />
                  <div className="font-semibold text-ink">{m.name}</div>
                  <div className="text-xs text-ink-soft">{m.eta}</div>
                  <div className="mt-2 font-display text-base font-bold text-ink">{m.price}</div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-2">
          <div className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-ink">Payment</h3>

            <div className="mt-5 relative aspect-[1.6/1] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0B1220] p-5 text-white shadow-xl">
              <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-neon/30 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest opacity-70">Voltra Pay</span>
                <Lock size={14} />
              </div>
              <div className="mt-10 font-display text-xl tracking-[0.25em]">4242  4242  4242  4242</div>
              <div className="mt-5 flex items-end justify-between text-xs">
                <div>
                  <div className="opacity-70">Cardholder</div>
                  <div className="font-semibold">RYMAN ALEX</div>
                </div>
                <div>
                  <div className="opacity-70">Expires</div>
                  <div className="font-semibold">12/29</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Expiry" placeholder="MM / YY" required />
              <Field label="CVV" placeholder="•••" required />
            </div>

            <div className="mt-5 border-t border-ink/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span className="text-ink">${subtotal}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Shipping</span><span className="text-ink">{shipping === 0 ? "Free" : `$${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Tax</span><span className="text-ink">${tax}</span></div>
              <div className="mt-2 flex justify-between border-t border-ink/10 pt-3">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-xl font-bold text-ink">${total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="btn-neon mt-5 w-full py-3 text-sm">
              Place Order
            </button>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-ink-muted">
              <Lock size={11} /> Encrypted with end-to-end TLS
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
