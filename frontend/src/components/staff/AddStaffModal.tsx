import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { X, UserPlus, Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credentials: { email: string; generatedPassword: string; name: string }) => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"PRODUCT_MANAGER" | "CUSTOMER_SUPPORT" | "ADMIN">("PRODUCT_MANAGER");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/users/staff", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        role,
      });

      const data = res.data?.data || res.data;
      const genPass = data?.generatedPassword || data?.password || "Voltra@Staff2026";
      const name = `${firstName} ${lastName}`.trim();

      onSuccess({
        email: email.trim(),
        generatedPassword: genPass,
        name,
      });

      resetForm();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create staff member";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setRole("PRODUCT_MANAGER");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Add New Staff Member</h2>
            <p className="text-xs text-ink-soft">Create staff account with auto-generated backend credentials.</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10 hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Morgan"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Staff Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.morgan@voltra.com"
              className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none transition focus:border-neon focus:ring-2 focus:ring-neon/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Staff System Role <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                options={[
                  { value: "PRODUCT_MANAGER", label: "Product Manager" },
                  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
                  { value: "ADMIN", label: "System Administrator" },
                ]}
                value={role}
                onChange={(val) => setRole(val as any)}
              />
            </div>
          </div>

          <div className="rounded-xl bg-neon/15 p-3 text-xs text-ink-soft border border-neon/30 flex items-center gap-2">
            <ShieldCheck size={16} className="text-neon-dark shrink-0" />
            <span>
              The initial login password will be automatically generated by the backend security system.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-neon inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {isSubmitting ? "Creating Account..." : "Create Staff Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
