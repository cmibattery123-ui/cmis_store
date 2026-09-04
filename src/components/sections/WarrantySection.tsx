"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, CheckCircle2, AlertCircle, Clock, 
  ChevronDown, Zap, ShieldCheck, ShieldAlert,
  Calendar, Award, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const WARRANTY_DATA = [
  {
    model: "CMIP 12-12",
    total: "60 Months",
    free: "24 Months",
    service: "36 Months",
    icon: <Zap className="w-6 h-6 text-primary" />,
    stats: [
      { label: "Total Protection", value: "5 Years" },
      { label: "Full Replacement", value: "2 Years" },
      { label: "Service Support", value: "3 Years" }
    ]
  },
  {
    model: "CMIP 12-09",
    total: "60 Months",
    free: "24 Months",
    service: "36 Months",
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    stats: [
      { label: "Total Protection", value: "5 Years" },
      { label: "Full Replacement", value: "2 Years" },
      { label: "Service Support", value: "3 Years" }
    ]
  },
  {
    model: "CMIP 12-06",
    total: "56 Months",
    free: "20 Months",
    service: "36 Months",
    icon: <Award className="w-6 h-6 text-primary" />,
    stats: [
      { label: "Total Protection", value: "4.6 Years" },
      { label: "Full Replacement", value: "1.6 Years" },
      { label: "Service Support", value: "3 Years" }
    ]
  }
];

const COVERAGE = {
  covered: [
    "Cell Failure (Internal manufacturing defect)",
    "Low Performance During Normal Usage",
    "Internal Short Circuit",
    "Manufacturing Defects in Workmanship"
  ],
  notCovered: [
    "Physical Damage (Cracks, drops, etc.)",
    "Water Damage or Liquid Ingress",
    "Fire Damage",
    "Overcharge or improper voltage usage",
    "Deep Discharge (Below safe levels)",
    "Wrong Charger Usage",
    "Tampering or unauthorized repairs"
  ]
};

export default function WarrantySection() {
  const [activeModel, setActiveModel] = useState(0);

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-[#000000] relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 space-y-3">
          <div>
            <span className="text-xs md:text-sm font-semibold tracking-normal text-amber-600 dark:text-primary">
              Reliability & Protection
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-[-0.025em]">
            Guaranteed Performance.
          </h2>
          
          <p className="text-base sm:text-lg text-[#6E6E73] dark:text-[#86868B] max-w-2xl mx-auto font-normal leading-relaxed">
            Every battery manufactured at our Coimbatore facility is backed by a direct manufacturer replacement guarantee and pan-India service.
          </p>
        </div>

        {/* Interactive Warranty Cards - Apple Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24">
          {WARRANTY_DATA.map((item, idx) => (
            <motion.div
              key={item.model}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "group relative bg-[#F5F5F7] dark:bg-[#161617] border rounded-[28px] p-8 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-lg dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]",
                activeModel === idx ? "border-amber-400 dark:border-primary/60 ring-1 ring-amber-400/40 dark:ring-primary/40 bg-white dark:bg-[#1C1C1E]" : "border-black/[0.04] dark:border-white/[0.08]"
              )}
              onClick={() => setActiveModel(idx)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-[#242426] flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-right">
                  <div className="text-slate-400 dark:text-gray-300 text-[10px] font-bold uppercase tracking-widest font-mono">Model</div>
                  <div className="text-slate-900 dark:text-white font-bold">{item.model}</div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white font-mono">{item.total.split(' ')[0]}</span>
                  <span className="text-slate-500 dark:text-gray-300 text-xs font-bold uppercase tracking-widest font-mono">Months Total</span>
                </div>

                {/* Mini Timeline Visual */}
                <div className="relative w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 dark:from-primary/50 dark:to-primary"
                  />
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-white/40 border-r border-white/60" 
                    style={{ width: `${(parseInt(item.free) / parseInt(item.total)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase font-mono">
                  <span className="text-amber-600 dark:text-primary">Free Replacement ({item.free})</span>
                  <span className="text-slate-500 dark:text-gray-300">Service ({item.service})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {item.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="bg-slate-50 dark:bg-[#161722] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-widest mb-1 font-mono">{stat.label}</div>
                    <div className="text-slate-900 dark:text-white font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Decorative Glow */}
              <div className="absolute inset-0 rounded-3xl bg-amber-500/5 dark:bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Comparison & Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-primary" />
              Warranty Comparison
            </h3>
            <div className="space-y-4">
              {WARRANTY_DATA.map((item, idx) => (
                <div 
                  key={idx}
                  className="relative p-5 rounded-2xl bg-slate-50 dark:bg-[#161722] border border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-primary/30 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-900 dark:text-white font-bold">{item.model}</span>
                    <span className="text-amber-600 dark:text-primary font-bold font-mono">{item.total}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Free: {item.free}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Service: {item.service}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coverage Checklist */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Covered */}
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-24 h-24 text-green-500" />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                 What is Covered?
               </h3>
               <div className="grid grid-cols-1 gap-4">
                 {COVERAGE.covered.map((item, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-slate-600 dark:text-gray-200 text-sm font-normal">
                     <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                     {item}
                   </div>
                 ))}
               </div>
            </div>

            {/* Not Covered */}
            <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert className="w-24 h-24 text-red-500" />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 Not Covered
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {COVERAGE.notCovered.map((item, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-slate-600 dark:text-gray-200 text-sm font-normal">
                     <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                     {item}
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>

        {/* Global Support Footer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center p-10 md:p-12 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20 dark:border-primary/20">
            <Info className="w-8 h-8 text-amber-600 dark:text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Peace of Mind, Standard</h3>
          <p className="text-slate-600 dark:text-gray-400 max-w-xl mx-auto mb-8 font-normal">
            Our warranty process is designed to be as efficient as our batteries. No complex forms, just fast support.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-mono font-bold">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
              <Clock className="w-4 h-4 text-amber-600 dark:text-primary" />
              7-Day Claim Resolution
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
              <Award className="w-4 h-4 text-amber-600 dark:text-primary" />
              Genuine Replacement
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
