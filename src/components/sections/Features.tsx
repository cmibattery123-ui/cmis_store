"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Droplets, Gauge, Leaf, Award, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    num: "01",
    title: "5000+ Charge Cycles",
    description: "Built to last with Grade-A LiFePO4 cells that outperform conventional batteries by over 500% with minimal capacity degradation.",
    icon: Zap,
    highlight: "5x Longer Life",
  },
  {
    num: "02",
    title: "IP67 Weather Resistance",
    description: "Hermetically sealed enclosure provides complete protection against dust ingress, monsoon water jets, and extreme climate changes.",
    icon: Droplets,
    highlight: "100% Sealed",
  },
  {
    num: "03",
    title: "99.2% Power Efficiency",
    description: "Ultra-low internal resistance guarantees near-lossless energy transfer, delivering maximum run-time and rapid 2-hour recharge.",
    icon: Gauge,
    highlight: "Ultra-Low Heat",
  },
  {
    num: "04",
    title: "Intelligent Smart BMS",
    description: "Real-time micro-controller telemetry actively monitors cell balancing, over-voltage, short circuits, and thermal limits.",
    icon: Shield,
    highlight: "Active Balancing",
  },
  {
    num: "05",
    title: "42+ Years of Precision",
    description: "Rooted in Coimbatore's premier industrial manufacturing legacy with certified ISO 9001:2015 quality standards.",
    icon: Award,
    highlight: "Certified Quality",
  },
  {
    num: "06",
    title: "100% Eco-Sustainable",
    description: "Zero heavy metals, zero acid fumes, and fully recyclable cell architecture designed for a sustainable clean energy future.",
    icon: Leaf,
    highlight: "Zero Fumes",
  },
];

export default function Features() {
  return (
    <section className="py-24 sm:py-32 bg-[#F5F5F7] dark:bg-[#000000] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Header - Apple Style */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div>
            <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
              Engineering Advantages
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
            Why Choose Perfect Batteries?
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal">
            Designed for maximum cycle life, safety, and zero-maintenance operation across home, commercial, and solar applications.
          </p>
        </div>

        {/* Apple Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="group relative p-8 rounded-[24px] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              {/* Top Content */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-[#242426] flex items-center justify-center text-amber-600 dark:text-primary transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-[#86868B] font-mono font-medium">
                    {feature.num}
                  </span>
                </div>

                <div className="text-xs font-semibold text-amber-600 dark:text-primary mb-1.5">
                  {feature.highlight}
                </div>

                <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Details Link */}
              <div className="pt-5 mt-6 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#86868B]">
                <span>Certified Standard</span>
                <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
