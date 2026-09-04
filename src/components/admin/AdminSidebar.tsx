"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, FileText, CreditCard, BarChart3,
  Warehouse, Bell, Settings, Zap, ChevronRight, Image as ImageIcon,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Dealers", href: "/admin/dealers", icon: Users },
  { label: "Quotations", href: "/admin/quotations", icon: FileText },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Tech Specs", href: "/admin/technical-specs", icon: FileText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ pendingQuotations = 0 }: { pendingQuotations?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    window.addEventListener("resize", handleClose);
    
    return () => {
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
      window.removeEventListener("resize", handleClose);
    };
  }, []);

  // Close mobile menu on route change
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
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(250,255,0,0.25)]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">PERFECT</div>
            <div className="text-[9px] text-amber-600 dark:text-primary font-mono font-bold tracking-widest uppercase">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
              
              {/* WhatsApp-style badge for pending quotations */}
              {label === "Quotations" && pendingQuotations > 0 && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black shrink-0 font-mono">
                  {pendingQuotations > 99 ? '99+' : pendingQuotations}
                </div>
              )}

              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Store Link */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-mono text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          View Store Front ↗
        </Link>
      </div>
      </aside>
    </>
  );
}
