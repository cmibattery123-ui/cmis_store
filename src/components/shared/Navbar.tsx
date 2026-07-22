"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PUBLIC_NAV = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Products", href: "/products" },
  { name: "Warranty", href: "/warranty" },
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSplash, setIsSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Only show splash screen on the Home page, and only once per session
    if (window.location.pathname === "/") {
      const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
      if (hasSeenSplash) {
        setIsSplash(false);
      } else {
        sessionStorage.setItem("hasSeenSplash", "true");
        setTimeout(() => setIsSplash(false), 2200);
      }
    } else {
      setIsSplash(false);
    }

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <AnimatePresence>
        {isSplash && mounted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div layoutId="logo-image" className="relative w-48 h-48">
                <img src={COMPANY_INFO.logo} alt="CMI Logo" className="object-contain w-full h-full" />
              </motion.div>
              <motion.div layoutId="logo-text" className="flex flex-col items-center text-center">
                <span className="font-heading font-bold text-6xl tracking-tighter leading-none text-white">PERFECT</span>
                <span className="text-xl mt-3 text-primary font-bold tracking-[0.2em] uppercase leading-none">BATTERIES</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black border-b border-white/10 py-3"
            : "bg-black/90 py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-6">
            <motion.div layoutId="logo-image" className="relative w-14 h-14 md:w-28 md:h-28">
              <img src={COMPANY_INFO.logo} alt="CMI Logo" className="object-contain w-full h-full" />
            </motion.div>
            <motion.div layoutId="logo-text" className="flex flex-col">
              <span className="font-heading font-bold text-2xl md:text-4xl tracking-tighter leading-none text-white">PERFECT</span>
              <span className="text-xs md:text-base mt-1 text-primary font-bold tracking-[0.2em] uppercase leading-none">BATTERIES</span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {PUBLIC_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative group",
                  pathname === link.href ? "text-primary" : "text-white/70"
                )}
              >
                {link.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full",
                    pathname === link.href ? "w-full" : ""
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-lg border-t border-white/10 px-4 py-6 space-y-4">
            {PUBLIC_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between text-lg font-heading font-bold py-2 transition-colors",
                  pathname === link.href ? "text-primary" : "text-white/80 hover:text-primary"
                )}
              >
                {link.name}
                <ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
