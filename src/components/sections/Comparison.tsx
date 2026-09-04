"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Zap, Scale, Weight, Recycle, Clock, CloudLightning } from "lucide-react";

const COMPARISON = [
  { feature: "Weight", lithium: "Lightweight (1/3rd)", lead: "Heavy & Bulky", icon: Weight },
  { feature: "Lifespan", lithium: "5000+ Cycles", lead: "300-500 Cycles", icon: Clock },
  { feature: "Maintenance", lithium: "Zero Maintenance", lead: "Frequent Water Top-ups", icon: CloudLightning },
  { feature: "Eco-Friendly", lithium: "100% Recyclable", lead: "Toxic Lead Acid", icon: Recycle },
  { feature: "Efficiency", lithium: "95% Energy Efficiency", lead: "70-80% Efficiency", icon: Zap },
];

export default function Comparison() {
  return (
    <section className="py-24 sm:py-32 bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] relative transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        {/* Apple Style Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div>
            <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
              Technology Benchmark
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
            Compare Technologies.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed max-w-2xl mx-auto">
            See how modern LiFePO4 cells compare to traditional lead-acid batteries in cycle life, weight, and total cost of ownership.
          </p>
        </div>

        {/* Desktop Comparison Table - Apple Style */}
        <div className="hidden md:block max-w-4xl mx-auto overflow-hidden rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161617] shadow-sm">
          <div className="grid grid-cols-3 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] p-6 md:p-7">
            <div className="text-[#6E6E73] dark:text-[#86868B] font-semibold text-xs uppercase tracking-wider">Features</div>
            <div className="text-amber-600 dark:text-primary font-bold text-xs uppercase tracking-wider text-center">Perfect Lithium</div>
            <div className="text-[#6E6E73] dark:text-[#86868B] font-semibold text-xs uppercase tracking-wider text-center">Lead Acid</div>
          </div>
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {COMPARISON.map((item, i) => (
              <div key={i} className="grid grid-cols-3 p-6 md:p-7 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.feature}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-500/15 dark:bg-primary/20 flex items-center justify-center text-amber-600 dark:text-primary">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-primary text-center">{item.lithium}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center text-[#86868B]">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-normal text-[#6E6E73] dark:text-[#86868B] text-center">{item.lead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Comparison Cards */}
        <div className="md:hidden space-y-4">
          {COMPARISON.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#161617] overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-2.5 px-5 py-3.5 bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.04] dark:border-white/[0.06]">
                <item.icon className="w-4 h-4 text-amber-600 dark:text-primary" />
                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.feature}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-black/[0.04] dark:divide-white/[0.06] p-4 text-center">
                <div className="space-y-1">
                  <div className="w-6 h-6 mx-auto rounded-full bg-amber-500/15 dark:bg-primary/20 flex items-center justify-center text-amber-600 dark:text-primary">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-amber-600 dark:text-primary">{item.lithium}</div>
                  <div className="text-[10px] text-[#86868B]">Lithium</div>
                </div>
                <div className="space-y-1">
                  <div className="w-6 h-6 mx-auto rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center text-[#86868B]">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-[#6E6E73] dark:text-[#86868B]">{item.lead}</div>
                  <div className="text-[10px] text-[#86868B]">Lead Acid</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Apple Feature Callout Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-7 rounded-[24px] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] space-y-2 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-primary">Cost Efficiency</div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Lower Total Cost of Ownership</h4>
            <p className="text-sm text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed">
              While the initial investment in lithium is higher, the total cost of ownership over 5+ years is up to 60% lower due to extreme longevity and zero maintenance.
            </p>
          </div>
          <div className="p-7 rounded-[24px] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] space-y-2 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-primary">Safety & Intelligence</div>
            <h4 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">Integrated Smart BMS</h4>
            <p className="text-sm text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed">
              Each unit features real-time micro-controller telemetry that actively balances cell voltages, prevents thermal runaway, and maximizes battery health.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
