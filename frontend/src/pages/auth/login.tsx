import Head from "next/head";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLogin } from "@/modules/auth/hooks/useLogin";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-ink/10 bg-white/70 pl-4 text-sm text-ink outline-none transition focus:border-neon focus:bg-white focus:ring-2 focus:ring-neon/40 ${
            isPasswordField ? "pr-11" : "pr-4"
          }`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink transition"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </label>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const loginMutation = useLogin();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password, rememberMe });
  };

  return (
    <>
      <Head>
        <title>Sign in — Voltra</title>
      </Head>
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16">
        <div className="glass p-8 md:p-10">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/logo/voltra_logo.png" alt="Voltra Logo" className="h-9 w-auto object-contain shrink-0" />
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                Voltra<span className="text-neon">.</span>
              </span>
            </Link>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Welcome back</h2>
            <p className="mt-1 text-sm text-ink-soft">Sign in to continue to Voltra.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[#CCFF00] h-4 w-4 rounded cursor-pointer"
                />{" "}
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="font-medium text-ink hover:underline">
                Forgot password?
              </Link>
            </div>

            {loginMutation.isError && (
              <div className="rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700">
                {(loginMutation.error as AxiosError<{ message: string }>)?.response?.data
                  ?.message || "Login failed. Check your credentials."}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-neon inline-flex w-full items-center justify-center gap-3 py-3 text-sm disabled:opacity-50"
            >
              {loginMutation.isPending ? "Signing in..." : "Login"} <ArrowUpRight size={16} />
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
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-ink hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
