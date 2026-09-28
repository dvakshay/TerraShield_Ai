import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Mountain,
  ShieldCheck,
  Waves,
} from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email address and password.");
      return;
    }

    setError("");

    if (rememberMe) {
      localStorage.setItem("terrashield-remember", "true");
    }

    onLogin();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040b14] text-white">
      {/* Background atmosphere */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/5 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 [background:linear-gradient(165deg,transparent_0%,transparent_35%,rgba(34,211,238,0.12)_35%,transparent_36%,transparent_47%,rgba(34,211,238,0.08)_47%,transparent_48%,transparent_60%,rgba(34,211,238,0.06)_60%,transparent_61%)]" />
      </div>

      {/* Login container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-6xl">
          <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#081321]/85 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left branding panel */}
            <div className="relative hidden min-h-[680px] overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
              <div>
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                    <ShieldCheck className="h-6 w-6 text-cyan-300" />
                  </div>

                  <div>
                    <div className="text-sm font-black tracking-[0.18em]">
                      TERRASHIELD
                    </div>

                    <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-cyan-400">
                      AI Disaster Intelligence
                    </div>
                  </div>
                </div>

                {/* Main message */}
                <div className="mt-24 max-w-lg">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure Command Portal
                  </div>

                  <h1 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                    See risk.
                    <br />
                    <span className="text-cyan-300">Act earlier.</span>
                  </h1>

                  <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                    Hyper-local disaster intelligence for landslide and
                    flash-flood monitoring across high-risk terrain.
                  </p>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]">
                  <Mountain className="mb-3 h-5 w-5 text-orange-300" />

                  <div className="text-xs font-semibold text-slate-200">
                    Terrain
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500">
                    Risk intelligence
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-400/20 hover:bg-white/[0.05]">
                  <Waves className="mb-3 h-5 w-5 text-blue-300" />

                  <div className="text-xs font-semibold text-slate-200">
                    Floods
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500">
                    Early awareness
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.05]">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />

                  <div className="text-xs font-semibold text-slate-200">
                    Response
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500">
                    Action support
                  </div>
                </div>
              </div>
            </div>

            {/* Right login panel */}
            <div className="flex min-h-[680px] items-center p-6 sm:p-10 lg:p-14">
              <div className="mx-auto w-full max-w-md">
                {/* Mobile logo */}
                <div className="mb-10 lg:hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                      <ShieldCheck className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div>
                      <div className="text-sm font-black tracking-[0.16em]">
                        TERRASHIELD
                      </div>

                      <div className="text-[9px] uppercase tracking-[0.25em] text-cyan-400">
                        AI Disaster Intelligence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <div className="mb-8">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Command Portal
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Welcome back
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to access the TerraShield regional monitoring
                    network.
                  </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-medium text-slate-400"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError("");
                        }}
                        placeholder="operator@terrashield.ai"
                        autoComplete="email"
                        className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-cyan-400/[0.03] focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-slate-400"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-[11px] text-cyan-400 transition hover:text-cyan-300"
                        onClick={() =>
                          setError(
                            "Password recovery will be available once authentication is connected."
                          )
                        }
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setError("");
                        }}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-cyan-400/[0.03] focus:ring-2 focus:ring-cyan-400/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-400"
                      />

                      Remember me
                    </label>

                    <span className="text-[10px] uppercase tracking-wider text-slate-600">
                      Secure access
                    </span>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-[#04101a] shadow-lg shadow-cyan-400/10 transition hover:-translate-y-0.5 hover:bg-cyan-300 active:translate-y-0"
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>

                {/* Registration link */}
                <div className="mt-8 text-center text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        "Account registration will be available once authentication is connected."
                      )
                    }
                    className="font-medium text-cyan-400 transition hover:text-cyan-300"
                  >
                    Create an account
                  </button>
                </div>

                {/* System status */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  TerraShield systems operational
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex flex-col items-center justify-between gap-2 px-2 text-[10px] text-slate-600 sm:flex-row">
            <span>
              TerraShield AI • Disaster Intelligence Platform
            </span>

            <span>
              Hyper-local disaster monitoring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}