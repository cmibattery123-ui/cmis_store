"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Mail, Phone, MapPin, Clock, ShieldCheck, Award, ArrowUpRight } from "lucide-react";
import { COMPANY_INFO, NAV_LINKS } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import CurrentYear from "@/components/shared/CurrentYear";
import { useWhatsAppSettings } from "@/store/whatsapp-settings";

export default function Footer() {
  const { whatsappUrl, whatsappPhoneDisplay, callPhoneDisplay, telUrl } = useWhatsAppSettings();

  return (
    <footer className="bg-[#F5F5F7] dark:bg-[#111112] text-[#1D1D1F] dark:text-[#F5F5F7] border-t border-black/[0.06] dark:border-white/[0.08] pt-16 pb-12 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200 dark:border-white/20 p-0.5 flex items-center justify-center">
                <Image
                  src={COMPANY_INFO.logo}
                  alt="CMI Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full rounded-full"
                />
              </div>
              <span className="font-semibold text-base tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Perfect Batteries
              </span>
            </Link>

            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed max-w-sm font-normal">
              Chinna Mayil Industries — Manufacturer of high-performance LiFePO4 batteries and solar energy storage systems in Coimbatore with over 42 years of engineering excellence.
            </p>

            {/* Certification & Recognition Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#6E6E73] dark:text-[#86868B] shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <span>ISO 9001:2015</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/25 dark:border-primary/25 text-xs text-amber-800 dark:text-primary shadow-sm font-medium">
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <span>DPIIT Startup • {COMPANY_INFO.dpiit}</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors font-normal"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals & Dealers (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
              Account & Portals
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link href="/auth/dealer-register" className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  Dealer Registration
                </Link>
              </li>
              <li>
                <Link href="/customer" className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  My Orders & Profile
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  Warranty Verification
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  Engineering Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
              Manufacturing HQ
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6E6E73] dark:text-[#86868B] font-normal">
              <li className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <span>Mon – Sat: 9:00 AM – 6:00 PM IST</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <a href={telUrl || `tel:${COMPANY_INFO.phoneRaw}`} className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  {callPhoneDisplay || COMPANY_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a href={whatsappUrl || COMPANY_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
                  WhatsApp: {whatsappPhoneDisplay || COMPANY_INFO.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                  {COMPANY_INFO.email}
                </a>
              </li>
            </ul>

            <a
              href="https://www.google.com/maps/place/CHINNA+MAYIL+INDUSTRIES/@10.9125928,76.96592,982m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3ba85b0e3fd33829:0xdfbb2ff8904c8b3f!8m2!3d10.9125928!4d76.9684949!16s%2Fg%2F11z6pt1lsq!18m1!1e1?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                <span className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">Madukkarai, Coimbatore</span>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Get Directions <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>
          </div>
        </div>

        {/* Bottom Bar - Apple Style */}
        <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[#86868B]">
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
            <p>© <CurrentYear /> {COMPANY_INFO.name} ({COMPANY_INFO.legalName}). All rights reserved.</p>
            <span className="hidden sm:inline opacity-40">•</span>
            <p className="font-mono">CIN: {COMPANY_INFO.cin}</p>
            <span className="hidden sm:inline opacity-40">•</span>
            <p className="font-mono">DPIIT Reg: {COMPANY_INFO.dpiit}</p>
          </div>
          <div className="flex gap-6 shrink-0">
            <Link href="/privacy" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Terms of Use</Link>
            <Link href="/contact" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
