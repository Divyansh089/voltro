import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "Sign in — Voltra" }] }),
});

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-xl border border-ink/10 bg-white/70 px-4 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/40"
      />
    </label>
  );
}

function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, mode === "signup" ? name : undefined);
    navigate({ to: "/profile" });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16">
      <div className="glass p-8 md:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">
              {mode === "login" ? "Welcome back" : "Join Voltra"}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {mode === "login"
                ? "Sign in to continue to Voltra."
                : "Create an account to unlock the ecosystem."}
            </p>
          </div>
        </div>

        {mode === "signup" && (
          <ul className="mt-6 grid grid-cols-1 gap-2">
            {["Secure checkout", "Order dashboard", "Priority support"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-neon text-ink">
                  <Check size={11} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          {mode === "signup" && (
            <Field label="Full name" placeholder="Ryman Alex" value={name} onChange={setName} required />
          )}
          <Field label="Email" type="email" placeholder="ryman@voltra.io" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} required />

          {mode === "login" && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" className="accent-[#CCFF00]" /> Remember me
              </label>
              <a href="#" className="font-medium text-ink hover:underline">
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" className="btn-neon inline-flex w-full items-center justify-center gap-3 py-3 text-sm">
            {mode === "login" ? "Login" : "Create account"} <ArrowUpRight size={16} />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-ink/10" /> or continue with <span className="h-px flex-1 bg-ink/10" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Google", "GitHub", "Apple"].map((l) => (
            <button
              key={l}
              type="button"
              className="grid h-11 place-items-center rounded-xl bg-white/70 text-xs font-semibold text-ink hover:bg-white"
            >
              {l}
            </button>
          ))}
        </div>

        <p className="mt-7 text-center text-sm text-ink-soft">
          {mode === "login" ? "New to Voltra? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
