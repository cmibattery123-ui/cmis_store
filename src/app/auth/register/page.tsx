"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { COMPANY_INFO } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setServerError(json.error || "Failed to create account. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setServerError("An error occurred during registration. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Account Created!
          </h2>
          <p className="text-slate-600 dark:text-gray-400 font-normal text-sm">Redirecting you to sign in…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 bg-grid transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
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
            Create your account
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm mt-1 font-normal">
            Join thousands of satisfied customers
          </p>
        </div>

        <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 mb-6 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                id="register-name"
                {...register("name")}
                type="text"
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
              />
              {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                id="register-email"
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
              />
              {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input
                id="register-phone"
                {...register("phone")}
                type="tel"
                placeholder="9999999999"
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
              />
              {errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 pr-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input
                id="register-confirm-password"
                {...register("confirmPassword")}
                type="password"
                placeholder="Repeat password"
                className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary focus:bg-white dark:focus:bg-[#181924] transition-all text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-mono">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black font-black uppercase tracking-wider text-xs py-4 rounded-2xl hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(250,255,0,0.3)] cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-amber-600 dark:text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
