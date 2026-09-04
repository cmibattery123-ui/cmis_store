"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2, AlertCircle, ShieldCheck, Mail } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { COMPANY_INFO } from "@/lib/constants";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [requirePin, setRequirePin] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function handleRedirect() {
    let targetUrl = callbackUrl;
    if (!targetUrl || targetUrl === "/") {
      try {
        const sessRes = await fetch("/api/auth/session");
        if (sessRes.ok) {
          const sess = await sessRes.json();
          if (sess?.user?.role === "ADMIN") {
            targetUrl = "/admin";
          } else if (sess?.user?.role === "DEALER") {
            targetUrl = "/dealer";
          }
        }
      } catch {}
    }
    window.location.href = targetUrl;
  }

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    setInfoMessage(null);

    try {
      const emailLower = data.email.toLowerCase().trim();

      // Step 1: Pre-verify credentials and check if Security PIN is required (for Admin / Dealer)
      if (!requirePin) {
        const checkRes = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailLower, password: data.password }),
        });

        const checkData = await checkRes.json();
        if (!checkRes.ok) {
          setServerError(checkData?.error ?? "Invalid email or password. Please check your credentials.");
          return;
        }

        const payload = checkData.data ?? checkData;

        if (payload?.requirePin) {
          setRequirePin(true);
          return;
        }

        // Standard user (Customer) login without PIN
        const result = await signIn("credentials", {
          email: emailLower,
          password: data.password,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          setServerError("Invalid email or password. Please check your credentials.");
          return;
        }

        await handleRedirect();
        return;
      }

      // Step 2: PIN active — verify Security PIN
      const enteredPin = (data.pin || data.code || "").trim();
      if (!enteredPin) {
        setServerError("Please enter your Security PIN.");
        return;
      }

      const result = await signIn("credentials", {
        email: emailLower,
        password: data.password,
        pin: enteredPin,
        code: enteredPin,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setServerError("Invalid Security PIN. Please enter a valid PIN.");
        return;
      }

      await handleRedirect();
    } catch (err) {
      console.error("[Login error]", err);
      setServerError("An error occurred during login. Please try again.");
    }
  }

  return (
    <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 mb-6 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      {infoMessage && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-primary text-xs rounded-2xl px-4 py-3 mb-6 font-mono">
          <Mail className="w-4 h-4 shrink-0" />
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="login-email"
            {...register("email")}
            type="email"
            readOnly={requirePin}
            autoComplete="email"
            placeholder="you@example.com"
            className={`w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm ${
              requirePin ? "opacity-75 cursor-not-allowed bg-slate-100 dark:bg-[#161722]" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              readOnly={requirePin}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 pr-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm ${
                requirePin ? "opacity-75 cursor-not-allowed bg-slate-100 dark:bg-[#161722]" : ""
              }`}
            />
            {!requirePin && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {errors.password && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.password.message}</p>
          )}
        </div>

        {/* Step 2: Security PIN Verification Field (Revealed ONLY for Admin & Dealer after clicking Sign In) */}
        {requirePin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="pt-2"
          >
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-pin" className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Security PIN
              </label>
              <button
                type="button"
                onClick={() => {
                  setRequirePin(false);
                  setServerError(null);
                }}
                className="text-xs font-mono text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Change Credentials
              </button>
            </div>
            <input
              id="login-pin"
              {...register("pin")}
              type="password"
              maxLength={6}
              autoFocus
              placeholder="••••••"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-amber-500 dark:border-primary rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#181924] transition-all font-mono tracking-widest text-center text-lg shadow-md"
            />
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 font-mono">
              Enter your 6-digit Security PIN to verify sign in.
            </p>
            {errors.pin && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.pin.message}</p>
            )}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-black uppercase tracking-wider text-xs py-4 rounded-2xl bg-primary text-black hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,255,0,0.3)] cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing…
            </>
          ) : requirePin ? (
            "Verify PIN & Sign In"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Google Sign-In Block */}
      <div className="mt-6">
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-4 text-slate-400 dark:text-gray-300 text-[10px] tracking-wider uppercase font-mono font-bold">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          type="button"
          className="mt-2 w-full flex items-center justify-center gap-3 bg-slate-100 dark:bg-[#161722] hover:bg-slate-200 dark:hover:bg-[#1E202B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-slate-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-amber-600 dark:text-primary font-bold hover:underline">
            Create account
          </Link>
        </p>
        <p className="text-sm text-slate-600 dark:text-gray-400">
          Are you a dealer?{" "}
          <Link href="/auth/dealer-register" className="text-amber-600 dark:text-primary font-bold hover:underline">
            Apply as Dealer
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-amber-500 dark:text-primary animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 bg-grid transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(250,255,0,0.3)]">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight uppercase">
              {COMPANY_INFO.brand}
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-6 uppercase tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">
            Sign in to your account to continue
          </p>
        </div>

        {/* Suspense-wrapped Card */}
        <Suspense fallback={<LoginFallback />}>
          <LoginFormContent />
        </Suspense>
      </motion.div>
    </div>
  );
}