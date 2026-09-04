"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, ShoppingCart } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { ThemeToggle } from "./ThemeToggle";

const PUBLIC_NAV = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Gallery", href: "/gallery" },
  { name: "Warranty", href: "/warranty" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const INTRO_SESSION_KEY = "perfect_batteries_intro_shown";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [targetPos, setTargetPos] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [splashDone, setSplashDone] = useState(true);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { totalItems } = useCart();

  const cartCount = mounted ? totalItems : 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Only play intro on the first entry per browser session
    try {
      const alreadySeen = sessionStorage.getItem(INTRO_SESSION_KEY);
      if (!alreadySeen) {
        sessionStorage.setItem(INTRO_SESSION_KEY, "true");
        setShowIntro(true);
        setSplashDone(false);

        const updateTargetPosition = () => {
          if (logoRef.current) {
            const rect = logoRef.current.getBoundingClientRect();
            setTargetPos({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }
        };

        updateTargetPosition();

        // Trigger smooth shrink transition after displaying full logo
        const startTimer = setTimeout(() => {
          updateTargetPosition();
          setAnimating(true);
        }, 200);

        // Conclude intro and switch seamlessly to regular navbar
        const finishTimer = setTimeout(() => {
          setSplashDone(true);
          setShowIntro(false);
        }, 1100);

        return () => {
          window.removeEventListener("scroll", handleScroll);
          clearTimeout(startTimer);
          clearTimeout(finishTimer);
        };
      } else {
        setSplashDone(true);
        setShowIntro(false);
      }
    } catch {
      setSplashDone(true);
      setShowIntro(false);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  // Hide on admin/dealer/customer routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dealer") ||
    pathname.startsWith("/customer")
  ) {
    return null;
  }

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const initialLogoSize = typeof window !== "undefined" && window.innerWidth < 640 ? 120 : 150;

  return (
    <>
      {/* Intro Splash Backdrop & Initial Load Typography (First-time visit only) */}
      <AnimatePresence>
        {showIntro && !splashDone && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: animating ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: animating ? 0.45 : 0, ease: "easeInOut" }}
            className="fixed inset-0 z-[9990] bg-[#FAFAFC]/95 dark:bg-[#07080C]/95 backdrop-blur-2xl pointer-events-none flex flex-col items-center justify-center"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/15 dark:bg-primary/20 blur-[100px] pointer-events-none" />

            {/* Intro text displayed below center logo on first load */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: animating ? 0 : 1, y: animating ? 14 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-28 flex flex-col items-center text-center space-y-1.5 px-4 w-full max-w-sm"
            >
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-amber-600 dark:text-primary">
                Chinna Mayil Industries
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {COMPANY_INFO.brand}
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-normal">
                Engineering Excellence Since 1982
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Flying/Shrinking Logo (First-time visit only) */}
      {showIntro && !splashDone && (
        <motion.div
          initial={{
            position: "fixed",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            width: initialLogoSize,
            height: initialLogoSize,
            boxShadow: "0 0 50px rgba(250, 255, 0, 0.45)",
            zIndex: 9999,
          }}
          animate={
            animating && targetPos
              ? {
                  position: "fixed",
                  top: targetPos.top,
                  left: targetPos.left,
                  x: 0,
                  y: 0,
                  width: targetPos.width,
                  height: targetPos.height,
                  boxShadow: "0 0 0px rgba(250, 255, 0, 0)",
                }
              : {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  x: "-50%",
                  y: "-50%",
                  width: initialLogoSize,
                  height: initialLogoSize,
                  boxShadow: "0 0 50px rgba(250, 255, 0, 0.45)",
                  zIndex: 9999,
                }
          }
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="rounded-full overflow-hidden bg-primary/10 border-2 border-primary/40 p-1 flex items-center justify-center pointer-events-none shadow-2xl"
        >
          <Image
            src={COMPANY_INFO.logo}
            alt="Perfect Batteries Logo"
            width={40}
            height={40}
            className="object-contain w-full h-full rounded-full"
          />
        </motion.div>
      )}

      {/* Main Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 sm:pt-5 transition-all duration-300 pointer-events-none">
        <motion.div
          initial={showIntro ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: showIntro ? 0.5 : 0, ease: "easeOut" }}
          className={cn(
            "max-w-6xl mx-auto rounded-full transition-all duration-300 pointer-events-auto flex items-center justify-between px-5 sm:px-7 py-3 border",
            scrolled
              ? "bg-white/95 dark:bg-[#000000]/95 backdrop-blur-2xl border-black/[0.12] dark:border-white/[0.18] shadow-[0_12px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.75)]"
              : "bg-white/90 dark:bg-[#0E0E10]/90 backdrop-blur-2xl border-black/[0.08] dark:border-white/[0.12] shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          )}
        >
          {/* Brand Mark with Destination Logo Element */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div
              ref={logoRef}
              className={cn(
                "relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/40 p-0.5 shrink-0 flex items-center justify-center group-hover:scale-105 transition-all shadow-sm",
                showIntro && !splashDone ? "opacity-0" : "opacity-100"
              )}
            >
              <Image
                src={COMPANY_INFO.logo}
                alt="CMI Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full rounded-full"
              />
            </div>

            <motion.div
              initial={showIntro ? { opacity: 0, x: -8 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: showIntro ? 1.0 : 0, ease: "easeOut" }}
              className="flex items-center"
            >
              <span className="font-bold text-base sm:text-lg tracking-tight leading-none text-[#1D1D1F] dark:text-white">
                {COMPANY_INFO.brand}
              </span>
            </motion.div>
          </Link>

          {/* Center Nav Links */}
          <motion.nav
            initial={showIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: showIntro ? 1.1 : 0, ease: "easeOut" }}
            className="hidden lg:flex items-center gap-1.5"
          >
            {PUBLIC_NAV.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13px] sm:text-sm px-4 py-2 rounded-full transition-all duration-200",
                    active
                      ? "bg-black/10 dark:bg-white/15 font-bold text-black dark:text-white shadow-sm"
                      : "text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 font-semibold"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </motion.nav>

          {/* Right Actions: Theme Toggle, Cart & Profile */}
          <motion.div
            initial={showIntro ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: showIntro ? 1.2 : 0, ease: "easeOut" }}
            className="flex items-center gap-2.5 shrink-0"
          >
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Cart Capsule */}
            <Link
              href="/cart"
              className="relative bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 w-10 h-10 rounded-full transition-all flex items-center justify-center text-slate-800 dark:text-white shrink-0 active:scale-95 shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4.5 h-4.5 text-slate-800 dark:text-white hover:text-amber-600 dark:hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black font-extrabold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-black shadow">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <UserProfileDropdown />

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center shrink-0">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white p-1 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden max-w-6xl mx-auto mt-2 bg-white/95 dark:bg-[#0E0E12]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl p-5 space-y-2 shadow-2xl pointer-events-auto"
            >
              {PUBLIC_NAV.map((link) => {
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between text-base font-bold py-3 px-4 rounded-2xl transition-colors",
                      active
                        ? "text-black bg-primary font-bold shadow-[0_0_15px_rgba(250,255,0,0.3)]"
                        : "text-slate-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                  >
                    <span>{link.name}</span>
                    <ChevronRight
                      className={cn("w-4 h-4", active ? "text-black" : "text-slate-400 dark:text-gray-500")}
                    />
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
