"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2, AlertCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { COMPANY_INFO } from "@/lib/constants";
import { checkIsAdmin } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPinField, setShowPinField] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    try {
      // Check if this is an administrator account
      const isAdmin = await checkIsAdmin(data.email);

      if (isAdmin && !showPinField) {
        setShowPinField(true);
        return; // Prompt user for PIN, do not sign in yet
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        pin: data.pin || "",
        redirect: false,
      });

      if (result?.error) {
        setServerError(
          isAdmin 
            ? "Invalid email, password, or PIN. Please try again." 
            : "Invalid email or password. Please try again."
        );
        return;
      }

      // Redirect based on role — middleware + session will handle final routing
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setServerError("An error occurred during login. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-bold text-white text-xl">
              {COMPANY_INFO.brand}
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-white mt-6">
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {showPinField && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 border-t border-white/5 pt-4"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#FFD700]">
                    Admin Security PIN
                  </label>
                  <span className="text-[10px] bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded-full border border-[#FFD700]/20 font-mono">
                    MFA Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    {...register("pin")}
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    className="w-full bg-white/5 border border-[#FFD700]/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-colors tracking-[0.5em] text-center font-bold font-mono"
                  />
                </div>
                <p className="text-gray-400 text-[11px] leading-normal">
                  Administrator account detected. Please enter your 6-digit security PIN to proceed.
                </p>
                {errors.pin && (
                  <p className="text-red-400 text-xs mt-1">{errors.pin.message}</p>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-heading font-bold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                showPinField
                  ? "bg-[#FFD700] text-black hover:bg-[#FFD700]/90 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_20px_rgba(255,215,0,0.25)]"
                  : "bg-primary text-black hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : showPinField ? (
                "Verify & Sign In"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you a dealer?{" "}
              <Link href="/auth/dealer-register" className="text-primary hover:underline">
                Apply as Dealer
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
