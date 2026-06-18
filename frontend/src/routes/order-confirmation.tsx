import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-confirmation")({
  component: Confirmation,
  head: () => ({ meta: [{ title: "Order placed — Voltra" }] }),
});

function Confirmation() {
  const orderId = "VLT-" + Math.floor(80000 + Math.random() * 9999);
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
      <div className="glass p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon text-ink">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-ink">Order placed!</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Thanks for shopping with Voltra. Your order <span className="font-semibold text-ink">#{orderId}</span> is being prepared.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/profile" className="btn-ink px-5 py-2.5 text-sm">Track order</Link>
          <Link to="/categories" className="btn-neon px-5 py-2.5 text-sm">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
