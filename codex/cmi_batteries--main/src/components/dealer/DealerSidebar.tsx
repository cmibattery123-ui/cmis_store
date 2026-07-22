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
        "fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-5 border-b border-white/5">
        <Link href="/dealer" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary fill-primary" />
          </div>
          <div>
            <div className="text-sm font-heading font-bold text-white leading-none">PERFECT</div>
            <div className="text-[9px] text-primary font-bold tracking-widest uppercase">Dealer Portal</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dealer" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          View Public Site ↗
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </div>
      </aside>
    </>
  );
}
