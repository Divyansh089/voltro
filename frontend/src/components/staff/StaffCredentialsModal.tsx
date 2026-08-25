import React from "react";
import { X, CheckCircle2, Mail, ShieldAlert, ArrowRight } from "lucide-react";

interface StaffCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    generatedPassword: string;
    name: string;
    role?: string;
  } | null;
}

export function StaffCredentialsModal({ isOpen, onClose, credentials }: StaffCredentialsModalProps) {
  if (!isOpen || !credentials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl md:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink transition"
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 mb-3 border border-emerald-500/30 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">Offer Letter Sent Successfully!</h2>
          <p className="text-xs text-ink-soft mt-1">
            An official employment offer letter and initial login credentials have been dispatched to the recipient's inbox.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-ink/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-muted">Staff Member</span>
            <span className="font-bold text-ink">{credentials.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-ink/5 pt-2">
            <span className="font-medium text-ink-muted flex items-center gap-1">
              <Mail size={13} /> Recipient Email
            </span>
            <span className="font-mono font-bold text-ink">{credentials.email}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-ink/5 pt-2">
            <span className="font-medium text-ink-muted">Assigned Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-500/15 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
              Offer Letter Delivered
            </span>
          </div>
        </div>

        {/* Security Instruction Box */}
        <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <ShieldAlert size={15} className="text-amber-600 shrink-0" />
            <span>Security Change Password Directive</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90 pl-5">
            The email contains temporary login credentials along with clear instructions directing the staff member to navigate to <strong>Settings</strong> and change their password immediately upon initial login.
          </p>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-neon w-full py-3 text-xs font-bold shadow-md flex items-center justify-center gap-2"
        >
          <span>Done</span>
          <ArrowRight size={14} />
        </button>

      </div>
    </div>
  );
}
