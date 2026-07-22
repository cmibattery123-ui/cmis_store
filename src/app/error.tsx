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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Something went wrong</h1>
          <p className="text-gray-400 mt-2 text-sm">
            An unexpected error occurred. Please try again or return home.
          </p>
          {error.digest && (
            <p className="text-gray-600 text-xs mt-2 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 border border-white/10 text-gray-300 font-medium px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
