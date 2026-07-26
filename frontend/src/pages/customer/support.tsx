import Head from "next/head";
import { MessageSquare } from "lucide-react";

export default function CustomerSupportPage() {
  return (
    <>
      <Head>
        <title>Support Tickets — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-16">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-neon" />
          <h1 className="font-display text-3xl font-bold text-ink">Support Tickets</h1>
        </div>
        <div className="glass mt-6 p-8">
          <p className="text-sm text-ink-soft">Your active support tickets will load here...</p>
        </div>
      </div>
    </>
  );
}
