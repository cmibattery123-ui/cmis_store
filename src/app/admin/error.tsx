"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-md w-full space-y-6 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl transition-colors duration-200">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-primary">
            Admin Portal Error
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
            Section Failed to Load
          </h2>
          <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm font-normal">
            An unexpected error occurred in the administration panel. You can attempt to reload this view or return to the main dashboard.
          </p>
          {error.digest && (
            <p className="text-slate-400 dark:text-gray-500 text-xs mt-2 font-mono">
              Error Digest: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-6 py-3 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-gray-300 font-mono font-bold text-xs uppercase px-6 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
