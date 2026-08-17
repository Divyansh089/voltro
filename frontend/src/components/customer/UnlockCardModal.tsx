import React, { useState } from "react";
import { Lock, Eye, EyeOff, X, ShieldCheck, RotateCw, CheckCircle2, CreditCard } from "lucide-react";

interface UnlockCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardholderName: string;
  onApplyCard: (cardDetails: { expiry: string; cvv: string; cardNumber: string }) => void;
}

export function UnlockCardModal({
  isOpen,
  onClose,
  cardholderName,
  onApplyCard,
}: UnlockCardModalProps) {
  const [step, setStep] = useState<"password" | "unlocked">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.trim().length < 3) {
      setError("Please enter your password to unlock security credentials.");
      return;
    }
    setError("");
    setStep("unlocked");
  };

  const handleApply = () => {
    onApplyCard({
      cardNumber: "4242 8888 9999 4242",
      expiry: "12/29",
      cvv: "888",
    });
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setStep("password");
    setPassword("");
    setError("");
    setIsFlipped(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition"
        >
          <X size={16} />
        </button>

        {step === "password" ? (
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neon/30 text-ink">
                <Lock size={22} className="text-ink" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Unlock Voltra Platinum</h3>
                <p className="text-xs text-ink-soft">Enter customer password to authenticate card details</p>
              </div>
            </div>

            <form onSubmit={handleUnlockSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password..."
                    className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 pr-11 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-3 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
                <span>Test Mode Active: Enter any password (e.g. <code>password123</code>) to inspect virtual card details.</span>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon px-6 py-2.5 text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <Lock size={14} /> Verify & Unlock Card
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-emerald-500" size={20} />
                <h3 className="font-display text-lg font-bold text-ink">Voltra Card Unlocked</h3>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Unlimited Funds
              </span>
            </div>

            <p className="mt-1 text-xs text-ink-soft">
              Click the card below to flip and inspect the 3-digit CVV security code.
            </p>

            {/* 3D Flippable Card Container */}
            <div
              className="mt-6 cursor-pointer select-none perspective-1000"
              onClick={() => setIsFlipped((f) => !f)}
            >
              <div
                className={`relative aspect-[1.6/1] w-full rounded-3xl transition-transform duration-700 transform-style-3d shadow-2xl ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* FRONT side */}
                <div
                  className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16] p-6 text-white backface-hidden border border-white/20 shadow-2xl ${
                    isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#CCFF00]/20 blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

                  {/* Top Row */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-[#CCFF00]" size={22} />
                      <span className="font-display text-sm font-extrabold tracking-widest text-[#CCFF00]">
                        VOLTRA PLATINUM
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                      CARD UNLOCKED
                    </span>
                  </div>

                  {/* Chip & Contactless */}
                  <div className="my-2 flex items-center justify-between z-10">
                    <div className="h-9 w-11 rounded-lg bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-100 border border-amber-200/50 shadow-inner flex items-center justify-center">
                      <div className="h-6 w-8 border-t border-b border-amber-600/40 rounded-sm" />
                    </div>
                    <RotateCw size={16} className="text-white/60 animate-spin-slow" />
                  </div>

                  {/* Card Number */}
                  <div className="font-display text-xl md:text-2xl font-semibold tracking-[0.2em] text-white z-10 drop-shadow">
                    4242 8888 9999 4242
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-end justify-between text-xs z-10">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Cardholder</div>
                      <div className="font-display font-bold uppercase tracking-wider text-white">
                        {cardholderName || "JOHN DOE"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Expires</div>
                      <div className="font-display font-bold text-white">12/29</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#CCFF00] font-bold">Available</div>
                      <div className="font-display font-bold text-[#CCFF00]">$25,000.00</div>
                    </div>
                  </div>
                </div>

                {/* BACK side */}
                <div
                  className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16] text-white backface-hidden border border-white/20 shadow-2xl rotate-y-180 ${
                    !isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="mt-5 h-12 w-full bg-black/90" />
                  
                  <div className="px-6 py-2">
                    <div className="flex items-center justify-between text-[10px] text-white/60 font-bold uppercase mb-1">
                      <span>Authorized Signature</span>
                      <span>Security CVV</span>
                    </div>
                    <div className="flex h-11 items-center justify-between rounded-xl bg-white px-4 text-ink">
                      <span className="font-serif italic text-sm text-ink-muted">
                        {cardholderName || "John Doe"}
                      </span>
                      <span className="font-display text-base font-extrabold tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                        888
                      </span>
                    </div>
                  </div>

                  <div className="p-6 text-[10px] text-white/40 flex items-center justify-between border-t border-white/10">
                    <span>Issued by Voltra Financial Inc.</span>
                    <span className="text-[#CCFF00] font-bold">Click to flip ↺</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs font-semibold text-ink-soft">
              💡 Tip: Click the card above to flip between Front and Back (CVV: 888).
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                className="btn-neon flex-1 py-3 text-xs font-extrabold shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Auto-Fill & Use Card on Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
