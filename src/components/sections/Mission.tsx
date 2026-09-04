"use client";

import React from "react";
import { Users, Cpu, TrendingUp, Zap, Award, Factory } from "lucide-react";
import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: Users,
    title: "Client Centricity",
    desc: "Delivering customized energy storage solutions tailored to residential, agricultural, and heavy industrial needs.",
    highlight: "100% Satisfaction",
    tag: "SUPPORT",
  },
  {
    icon: Cpu,
    title: "Technological Rigor",
    desc: "Equipped with automated cell testing, thermal chambers, and smart BMS programming for fail-safe power integrity.",
    highlight: "Smart Telemetry",
    tag: "INNOVATION",
  },
  {
    icon: TrendingUp,
    title: "Continuous Evolution",
    desc: "Constantly advancing energy density, charge velocity, and safety cycles through active Coimbatore R&D.",
    highlight: "Future-Ready",
    tag: "R&D",
  },
];

export default function Mission() {
  return (
    <section className="py-24 sm:py-32 bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header - Apple Style */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div>
            <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
              Our Core Principles
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
            Built with Purpose.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal">
            At Chinna Mayil Industries, we are dedicated to manufacturing dependable, zero-maintenance energy storage for homes and industry.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="p-8 rounded-[24px] bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-[#242426] flex items-center justify-center text-amber-600 dark:text-primary">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[11px] font-semibold text-[#6E6E73] dark:text-[#86868B]">
                    {pillar.tag}
                  </span>
                </div>

                <div className="text-xs font-semibold text-amber-600 dark:text-primary mb-1.5">
                  {pillar.highlight}
                </div>

                <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2 tracking-tight">
                  {pillar.title}
                </h3>

                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed font-normal">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2 text-xs text-[#86868B]">
                <Factory className="w-4 h-4 text-amber-600 dark:text-primary" />
                <span>Coimbatore Plant Certified</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
