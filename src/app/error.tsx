"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
      <div className="text-center max-w-md space-y-6 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm font-normal">
            An unexpected error occurred. Please try again or return home.
          </p>
          {error.digest && (
            <p className="text-slate-400 dark:text-gray-500 text-xs mt-2 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-6 py-3 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-gray-300 font-mono font-bold text-xs uppercase px-6 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
