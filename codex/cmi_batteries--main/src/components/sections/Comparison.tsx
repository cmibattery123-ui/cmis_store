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
    <section className="py-16 md:py-24 bg-[#050505] relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-4">
          <h2 className="text-primary font-heading font-bold uppercase tracking-widest text-sm">The Evolution</h2>
          <h3 className="text-3xl md:text-5xl font-heading font-bold text-white">Lithium vs. Lead Acid</h3>
          <p className="text-gray-400 text-sm md:text-base">Why world-leading industries are switching to Perfect Lithium technology.</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block max-w-4xl mx-auto overflow-hidden rounded-3xl border border-white/5 bg-[#0A0A0A]">
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/5 p-6 md:p-8">
            <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Features</div>
            <div className="text-primary font-heading font-bold uppercase tracking-widest text-xs text-center">Perfect Lithium</div>
            <div className="text-gray-500 font-heading font-bold uppercase tracking-widest text-xs text-center">Lead Acid</div>
          </div>
          <div className="divide-y divide-white/5">
            {COMPARISON.map((item, i) => (
              <div key={i} className="grid grid-cols-3 p-6 md:p-8 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center text-gray-500">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{item.feature}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-primary text-center">{item.lithium}</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <X className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 text-center">{item.lead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {COMPARISON.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-primary">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">{item.feature}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-primary text-center">{item.lithium}</span>
                  <span className="text-[10px] text-primary/60 uppercase tracking-widest">Lithium</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <X className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 text-center">{item.lead}</span>
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">Lead Acid</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-3 md:space-y-4">
            <h4 className="text-lg md:text-xl font-heading font-bold text-primary">Future-Ready ROI</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              While the initial investment in lithium is higher, the total cost of ownership is 60% lower due to longevity and zero maintenance.
            </p>
          </div>
          <div className="p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-3 md:space-y-4">
            <h4 className="text-lg md:text-xl font-heading font-bold text-white">Smart Integration</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Equipped with smart BMS that monitors health, temperature, and cell balance in real-time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
