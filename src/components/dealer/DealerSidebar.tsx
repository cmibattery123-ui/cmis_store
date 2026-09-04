"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart,
  FileText, User, Zap, ChevronRight, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { label: "Overview", href: "/dealer", icon: LayoutDashboard },
  { label: "Product Catalog", href: "/dealer/products", icon: Package },
  { label: "My Orders", href: "/dealer/orders", icon: ShoppingCart },
  { label: "Quotations", href: "/dealer/quotations", icon: FileText },
  { label: "My Profile", href: "/dealer/profile", icon: User },
];

export default function DealerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener("toggle-dealer-sidebar", handleToggle);
    window.addEventListener("resize", handleClose);
    
    return () => {
      window.removeEventListener("toggle-dealer-sidebar", handleToggle);
      window.removeEventListener("resize", handleClose);
    };
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 h-full bg-white dark:bg-[#0C0D14] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-5 border-b border-slate-200 dark:border-white/10">
        <Link href="/dealer" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(250,255,0,0.25)]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">PERFECT</div>
            <div className="text-[9px] text-amber-600 dark:text-primary font-mono font-bold tracking-widest uppercase">Dealer Portal</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dealer" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all group",
                isActive
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(250,255,0,0.25)]"
                  : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          View Public Site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>
      </aside>
    </>
  );
}
