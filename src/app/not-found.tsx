import Link from "next/link";
import { Search, Home } from "lucide-react";
import Footer from "@/components/shared/Footer";

export default function NotFound() {
  return (
    <>
      <main className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center max-w-lg space-y-8">
          {/* 404 visual */}
          <div className="relative">
            <div className="text-[10rem] font-black text-slate-200 dark:text-white/5 leading-none select-none font-mono">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-amber-500/10 dark:bg-primary/10 rounded-2xl flex items-center justify-center">
                <Search className="w-10 h-10 text-amber-600 dark:text-primary" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Page Not Found</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-3 font-normal">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)]"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-wider"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
