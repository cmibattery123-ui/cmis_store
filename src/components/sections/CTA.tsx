"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ChevronRight, PhoneCall, ShieldCheck, Truck, Headphones } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-white dark:bg-[#000000] transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-[#F5F5F7] dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-5 max-w-2xl text-center lg:text-left">
              <div>
                <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
                  Partner with Us
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight tracking-[-0.025em]">
                Ready to upgrade your energy storage?
              </h2>

              <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal">
                Join our network of 200+ authorized dealers or consult our engineering team in Coimbatore for custom battery pack solutions.
              </p>

              {/* Action Buttons - Apple Pill Style */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/auth/dealer-register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-yellow-300 transition-all shadow-sm active:scale-[0.98]"
                >
                  <span>Become a Dealer</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#242426] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-sm px-7 py-3.5 rounded-full transition-all active:scale-[0.98] shadow-sm"
                >
                  <PhoneCall className="w-4 h-4 text-amber-600 dark:text-primary" />
                  <span>Contact Sales</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#6E6E73] dark:text-[#86868B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-primary" />
                  <span>5-Year Full Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600 dark:text-primary" />
                  <span>Pan-India Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-600 dark:text-primary" />
                  <span>Dedicated Support</span>
                </div>
              </div>
            </div>

            {/* Heritage Badge Block */}
            <div className="relative shrink-0 hidden lg:flex items-center justify-center">
              <div className="w-56 h-56 rounded-[28px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] flex flex-col items-center justify-center p-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-[#242426] flex items-center justify-center mb-3">
                  <Zap className="w-8 h-8 text-amber-600 dark:text-primary fill-current" />
                </div>
                <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">42+ Years</div>
                <div className="text-xs text-[#86868B] mt-0.5">Manufacturing Heritage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
