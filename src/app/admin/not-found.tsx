import Link from "next/link";
import { Search, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="text-center max-w-md w-full space-y-6 bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 rounded-3xl p-8 shadow-xl transition-colors duration-200">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-primary">
          <Search className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-primary">
            Admin 404
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
            Resource Not Found
          </h2>
          <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm font-normal">
            The requested admin item, record, or management page could not be located.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 bg-primary text-black font-black uppercase tracking-wider text-xs px-6 py-3 rounded-2xl hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.25)]"
          >
            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center justify-center gap-2 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-gray-300 font-mono font-bold text-xs uppercase px-6 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Products
          </Link>
        </div>
      </div>
    </div>
  );
}
