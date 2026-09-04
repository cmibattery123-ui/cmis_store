"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, Zap } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  let errorMessage = "An unexpected error occurred during authentication.";
  let actionHelp = "Please try logging in again with your email and password.";

  if (error === "Configuration") {
    errorMessage = "Server authentication configuration is initializing.";
    actionHelp = "Please refresh and sign in using your account email and password.";
  } else if (error === "AccessDenied") {
    errorMessage = "Access was denied. You do not have permission to sign in.";
    actionHelp = "Please check your credentials or contact administrator.";
  } else if (error === "Verification") {
    errorMessage = "The authentication token has expired or is invalid.";
    actionHelp = "Please request a new sign-in attempt.";
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount") {
    errorMessage = "There was a problem signing in with your Google account.";
    actionHelp = "Ensure Google redirect URIs are configured, or use standard email & password sign-in.";
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 text-center shadow-xl text-slate-900 dark:text-white">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
        Authentication Notice
      </h1>

      <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-3 font-normal">
        {errorMessage}
      </p>

      <p className="text-slate-400 dark:text-gray-300 text-xs font-mono mb-8">
        {actionHelp}
      </p>

      <div className="space-y-3">
        <Link
          href="/auth/login"
          className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs py-3.5 px-4 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-[#161722] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-xs uppercase py-3.5 px-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-[#1E202B] transition-colors"
        >
          <span>Go to Store Homepage</span>
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
      <Suspense
        fallback={
          <div className="text-slate-600 dark:text-white flex items-center gap-2 font-mono text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600 dark:text-primary" />
            <span>Loading authentication details…</span>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </main>
  );
}
