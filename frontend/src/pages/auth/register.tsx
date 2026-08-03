import Head from "next/head";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRegister } from "@/modules/auth/hooks/useRegister";

import { AxiosError } from "axios";

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

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const registerMutation = useRegister();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName) return;
    registerMutation.mutate({ email, password, firstName, lastName });
  };

  return (
    <>
      <Head>
        <title>Create account — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16">
        <div className="glass p-8 md:p-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">Join Voltra</h2>
            <p className="mt-1 text-sm text-ink-soft">Create an account to unlock the ecosystem.</p>
          </div>

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

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                placeholder="Ryman"
                value={firstName}
                onChange={setFirstName}
                required
              />
              <Field label="Last name" placeholder="Alex" value={lastName} onChange={setLastName} />
            </div>
            <Field
              label="Email"
              type="email"
              placeholder="ryman@voltra.io"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            {registerMutation.isError && (
              <div className="rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700">
                {(registerMutation.error as AxiosError<{ message: string }>)?.response?.data
                  ?.message || "Registration failed."}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-neon inline-flex w-full items-center justify-center gap-3 py-3 text-sm disabled:opacity-50"
            >
              {registerMutation.isPending ? "Creating..." : "Create account"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-ink/10" /> or continue with{" "}
            <span className="h-px flex-1 bg-ink/10" />
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

          <div className="mt-6 text-center text-xs text-ink-soft">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-ink hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
