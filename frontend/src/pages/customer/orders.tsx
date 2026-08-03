import Head from "next/head";
import { Package } from "lucide-react";

export default function CustomerOrdersPage() {
  return (
    <>
      <Head>
        <title>My Orders — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <div className="flex items-center gap-3">
          <Package className="text-neon" />
          <h1 className="font-display text-3xl font-bold text-ink">My Orders</h1>
        </div>
        <div className="glass mt-6 p-8">
          <p className="text-sm text-ink-soft">Your orders list will load here from the API...</p>
        </div>
      </div>
    </>
  );
}
