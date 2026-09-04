"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Building2,
  Package,
  ShieldCheck,
  ChevronRight,
  MapPin,
  FileText,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface UserProfileDropdownProps {
  /** Optional custom dashboard URL (overrides auto-detection) */
  dashboardHref?: string;
  /** Optional fallback name when session user has no name */
  fallbackName?: string;
  /** Optional fallback email when session user has no email */
  fallbackEmail?: string;
  /** Optional additional class name for the wrapper container */
  className?: string;
}

export function UserProfileDropdown({
  dashboardHref,
  fallbackName = "User",
  fallbackEmail = "",
  className = "",
}: UserProfileDropdownProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const role = (session?.user as any)?.role || "CUSTOMER";

  // Determine dashboard link based on role
  const getDashboardInfo = () => {
    if (dashboardHref) {
      return { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard };
    }
    if (role === "ADMIN") {
      return { href: "/admin", label: "Admin Dashboard", icon: ShieldCheck };
    }
    if (role === "DEALER") {
      return { href: "/dealer", label: "Dealer Portal", icon: Building2 };
    }
    return { href: "/customer", label: "Overview", icon: LayoutDashboard };
  };

  const dashboardInfo = getDashboardInfo();

  // User details derived strictly from NextAuth session
  const userName = session?.user?.name || fallbackName;
  const userEmail = session?.user?.email || fallbackEmail;

  // Toggle dropdown open/close state
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Click-outside detection to auto-close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button: Circular icon button (<User/>) */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-primary/50 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
      >
        <User className="w-5 h-5" />
        {isAuthenticated && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 dark:bg-primary rounded-full border-2 border-white dark:border-black" />
        )}
      </button>

      {/* Dropdown Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/15 shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            {isAuthenticated ? (
              /* ================= Logged In State ================= */
              <>
                {/* User Info Header */}
                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
                      {userName}
                    </p>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-primary/10 text-amber-600 dark:text-primary border border-amber-500/20 dark:border-primary/20 shrink-0">
                      {role}
                    </span>
                  </div>
                  {userEmail && (
                    <p className="text-xs text-slate-500 dark:text-gray-300 truncate mt-0.5 font-medium">
                      {userEmail}
                    </p>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="p-1.5 border-b border-slate-100 dark:border-white/10 space-y-0.5">
                  <Link
                    href={dashboardInfo.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                  >
                    <dashboardInfo.icon className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                    <span>{dashboardInfo.label}</span>
                  </Link>

                  {role === "CUSTOMER" && (
                    <>
                      <Link
                        href="/customer/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <Package className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/customer/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <User className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/customer/addresses"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Addresses</span>
                      </Link>
                    </>
                  )}

                  {role === "DEALER" && (
                    <>
                      <Link
                        href="/dealer/quotations"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <FileText className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Quotations</span>
                      </Link>

                      <Link
                        href="/dealer/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <Package className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Dealer Orders</span>
                      </Link>

                      <Link
                        href="/dealer/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <User className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Company Profile</span>
                      </Link>
                    </>
                  )}

                  {role === "ADMIN" && (
                    <>
                      <Link
                        href="/admin/products"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <Package className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Products</span>
                      </Link>

                      <Link
                        href="/admin/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-100 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                      >
                        <Settings className="w-4 h-4 text-amber-600 dark:text-primary group-hover:scale-110 transition-transform duration-150" />
                        <span>Settings</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Sign Out Button */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-150 group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-150" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              /* ================= Logged Out / Guest State ================= */
              <>
                {/* Guest Header */}
                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome to Perfect Batteries
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-300 mt-0.5 font-normal">
                    Sign in to access your orders & account
                  </p>
                </div>

                {/* Primary Sign In CTA */}
                <div className="p-2 border-b border-slate-100 dark:border-white/10">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-primary hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_15px_rgba(250,255,0,0.2)]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>

                {/* Secondary Actions */}
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="w-4 h-4 text-slate-400 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-primary transition-colors" />
                      <span>Create Account</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white" />
                  </Link>

                  <Link
                    href="/auth/dealer-register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#1E202B] hover:text-slate-900 dark:hover:text-white transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-400 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-primary transition-colors" />
                      <span>Dealer Portal</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-white" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserProfileDropdown;
