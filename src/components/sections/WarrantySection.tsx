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
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6"
          >
            <ShieldCheck className="w-4 h-4" />
            Reliability Guaranteed
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-bold text-white uppercase tracking-tight mb-6"
          >
            Trusted <span className="text-primary">Warranty</span> Protection
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Built for long-term reliability with industry-leading warranty support and service coverage.
          </motion.p>
        </div>

        {/* Interactive Warranty Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {WARRANTY_DATA.map((item, idx) => (
            <motion.div
              key={item.model}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "group relative bg-white/5 border rounded-[2.5rem] p-8 transition-all duration-500",
                activeModel === idx ? "border-primary/50 shadow-[0_20px_50px_rgba(250,255,0,0.1)]" : "border-white/10"
              )}
              onClick={() => setActiveModel(idx)}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  {item.icon}
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Model</div>
                  <div className="text-white font-heading font-bold">{item.model}</div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-heading font-bold text-white">{item.total.split(' ')[0]}</span>
                  <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Months Total</span>
                </div>

                {/* Mini Timeline Visual */}
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary"
                  />
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-white/20 border-r border-white/40" 
                    style={{ width: `${(parseInt(item.free) / parseInt(item.total)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
                  <span className="text-primary">Free Replacement ({item.free})</span>
                  <span className="text-gray-500">Service ({item.service})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {item.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-white font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Decorative Glow */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12"
          >
            <h3 className="text-2xl font-heading font-bold text-white mb-8 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              Warranty Comparison
            </h3>
            <div className="space-y-6">
              {WARRANTY_DATA.map((item, idx) => (
                <div 
                  key={idx}
                  className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold">{item.model}</span>
                    <span className="text-primary font-bold">{item.total}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
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
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-24 h-24 text-green-500" />
               </div>
               <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                 What is Covered?
               </h3>
               <div className="grid grid-cols-1 gap-4">
                 {COVERAGE.covered.map((item, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                     <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                     {item}
                   </div>
                 ))}
               </div>
            </div>

            {/* Not Covered */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert className="w-24 h-24 text-red-500" />
               </div>
               <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 text-red-500" />
                 Not Covered
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {COVERAGE.notCovered.map((item, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                     <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" />
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
          className="mt-24 text-center p-12 rounded-[3rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Info className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4 uppercase">Peace of Mind, Standard</h3>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Our warranty process is designed to be as efficient as our batteries. No complex forms, just fast support.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 text-white font-bold">
              <Clock className="w-5 h-5 text-primary" />
              7-Day Claim Resolution
            </div>
            <div className="flex items-center gap-3 text-white font-bold">
              <Award className="w-5 h-5 text-primary" />
              Genuine Replacement
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
