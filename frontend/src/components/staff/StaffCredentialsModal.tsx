import { useState } from "react";
import { X, Check, Copy, KeyRound, ShieldCheck, Mail, AlertTriangle } from "lucide-react";

interface StaffCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    generatedPassword: string;
    name: string;
  } | null;
}

export function StaffCredentialsModal({ isOpen, onClose, credentials }: StaffCredentialsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  if (!isOpen || !credentials) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(credentials.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(credentials.generatedPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl md:p-8 animate-fadeIn space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">One-Time Staff Credentials</h2>
              <p className="text-xs text-ink-soft">Account created for {credentials.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Credentials Cards */}
        <div className="space-y-3">
          {/* Email Field */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-ink/5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Mail size={13} /> Staff Email ID
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-sm font-bold text-ink truncate pr-2">
                {credentials.email}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1 text-xs font-bold text-ink hover:text-neon-dark px-2.5 py-1 rounded-lg bg-white border border-ink/10 shadow-sm transition"
              >
                {copiedEmail ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copiedEmail ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Generated Password Field */}
          <div className="rounded-2xl bg-neon/15 p-4 border border-neon/40 space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neon-dark flex items-center gap-1.5">
              <KeyRound size={13} /> Backend Generated Password
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-base font-extrabold text-ink tracking-wider bg-white/80 px-3 py-1 rounded-xl border border-neon/50 shadow-inner">
                {credentials.generatedPassword}
              </span>
              <button
                type="button"
                onClick={handleCopyPass}
                className="flex items-center gap-1 text-xs font-extrabold text-ink hover:text-neon-dark px-3 py-1.5 rounded-xl bg-white border border-ink/10 shadow-sm transition"
              >
                {copiedPass ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copiedPass ? "Copied" : "Copy Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Notice Warning */}
        <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertTriangle size={15} /> Please copy these credentials now
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Provide these credentials to the staff member so they can sign in. This temporary password window will not be shown again.
          </p>
        </div>

        {/* Footer Confirmation Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-neon w-full py-3 text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
        >
          <Check size={16} /> I Have Saved Credentials
        </button>
      </div>
    </div>
  );
}
