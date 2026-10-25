"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PhoneCall, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeWhatsAppPhone, formatPhoneDisplay, buildTelUrl } from "@/lib/whatsapp";

interface WhatsAppConfig {
  whatsappPhone: string;
  whatsappPhoneDisplay: string;
  whatsappUrl: string;
  telUrl: string;
  whatsappEnabled: boolean;
}

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWhatsAppSettings() {
      try {
        const res = await fetch("/api/payments/status", { cache: "no-store" });
        if (res.ok && isMounted) {
          const json = await res.json();
          const data = json?.data;
          if (data) {
            const rawPhone = data.rawPhone || data.whatsappPhone || "";
            const cleanPhone = normalizeWhatsAppPhone(rawPhone);
            const phoneDisplay = data.whatsappPhoneDisplay || formatPhoneDisplay(rawPhone) || rawPhone;
            const message =
              data.whatsappMessage ||
              "Hello Perfect Batteries, I would like to inquire about your products.";
            const waUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
              : "";
            const tel = cleanPhone ? buildTelUrl(cleanPhone) : "";

            setConfig({
              whatsappPhone: cleanPhone,
              whatsappPhoneDisplay: phoneDisplay,
              whatsappUrl: waUrl,
              telUrl: tel,
              whatsappEnabled: data.whatsappEnabled !== undefined ? Boolean(data.whatsappEnabled) : true,
            });
          }
        }
      } catch (err) {
        console.error("[FloatingContact] Failed to fetch WhatsApp settings:", err);
      }
    }

    fetchWhatsAppSettings();

    const handleUpdate = () => {
      fetchWhatsAppSettings();
    };

    window.addEventListener("whatsapp-settings-updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("whatsapp-settings-updated", handleUpdate);
    };
  }, []);

  // Hide on admin, dealer, or customer dashboard routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dealer") ||
    pathname.startsWith("/customer")
  ) {
    return null;
  }

  // If WhatsApp settings have loaded and WhatsApp is explicitly disabled by admin, hide the widget
  if (config && !config.whatsappEnabled) {
    return null;
  }

  const activeWaUrl = config?.whatsappUrl || "";
  const activeTelUrl = config?.telUrl || "";
  const displayPhone = config?.whatsappPhoneDisplay || config?.whatsappPhone || "";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Expanded Quick Contact Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#12131A] border border-slate-200 dark:border-white/15 rounded-3xl p-4 shadow-2xl space-y-3 w-64 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Contact & Support
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                aria-label="Close contact popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Chat Link */}
            {activeWaUrl && (
              <a
                href={activeWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-black flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white">Chat on WhatsApp</p>
                  {displayPhone && (
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">{displayPhone}</p>
                  )}
                </div>
              </a>
            )}

            {/* Direct Phone Call */}
            {activeTelUrl && (
              <a
                href={activeTelUrl}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-4 h-4 text-black" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white">Call Office Directly</p>
                  {displayPhone && (
                    <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 truncate">{displayPhone}</p>
                  )}
                </div>
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {activeWaUrl && (
          <a
            href={activeWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#12131A] border border-emerald-500/30 text-slate-900 dark:text-white text-xs font-bold shadow-lg hover:border-emerald-500 transition-all group"
            aria-label="Direct WhatsApp Chat"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Chat on WhatsApp</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-emerald-400 text-black flex items-center justify-center shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          aria-label="Open contact and WhatsApp menu"
        >
          <div className="relative flex items-center justify-center">
            {open ? (
              <X className="w-6 h-6 text-black transition-transform" />
            ) : (
              <WhatsAppIcon className="w-7 h-7 text-black transition-transform" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
