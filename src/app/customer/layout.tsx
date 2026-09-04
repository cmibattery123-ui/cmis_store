"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, ShoppingCart, MapPin, LogOut, Home, Loader2 } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const navItems = [
  { href: "/customer", label: "Overview", icon: Home },
  { href: "/customer/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/customer/profile", label: "Profile", icon: User },
  { href: "/customer/addresses", label: "Addresses", icon: MapPin },
];

import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname || "/customer")}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-200">
        <Loader2 className="w-8 h-8 text-amber-500 dark:text-primary animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080C] text-slate-900 dark:text-white flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0C0D14] border-r border-slate-200 dark:border-white/10 p-5 shrink-0 transition-colors duration-200">
        <div className="flex items-center justify-between mb-8 px-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(250,255,0,0.25)]">
              <span className="font-black text-black text-xs">PB</span>
            </div>
            <span className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase">{COMPANY_INFO.brand}</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="px-3 py-4 mb-6 rounded-2xl bg-slate-100 dark:bg-[#12131A] border border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 bg-amber-500/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-amber-600 dark:text-primary" />
          </div>
          <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{session.user.name || "Customer"}</p>
          <p className="text-slate-500 dark:text-gray-300 text-xs truncate font-mono mt-0.5">{session.user.email}</p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-xs font-mono font-bold uppercase tracking-wider ${
                  isActive
                    ? "bg-primary text-black shadow-[0_0_20px_rgba(250,255,0,0.3)]"
                    : "text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161722]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-mono font-bold uppercase tracking-wider text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-[#0C0D14] border-b border-slate-200 dark:border-white/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <Link href="/" className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{COMPANY_INFO.brand}</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-mono text-slate-500 dark:text-gray-400 hover:text-red-500 flex items-center gap-1 p-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0C0D14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "text-amber-600 dark:text-primary" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-600 dark:text-primary" : "text-slate-400 dark:text-gray-400"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
