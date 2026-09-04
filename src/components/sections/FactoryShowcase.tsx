"use client";

import React from "react";
import { motion } from "framer-motion";
import { Factory, Shield, Zap, Settings } from "lucide-react";
import Image from "next/image";

export default function FactoryShowcase() {
  return (
    <section className="py-24 bg-white dark:bg-[#07080C] relative overflow-hidden transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
              <Factory className="w-3.5 h-3.5" />
              <span>Coimbatore Manufacturing Facility</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              State-of-the-Art <br />
              <span className="text-amber-600 dark:text-primary">Production Plant</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed font-normal">
              Our 20,000+ sq. ft. manufacturing facility in Madukkarai, Coimbatore is equipped with automated cell grading, laser welding, and rigorous multi-stage load testing.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 hover:border-amber-400 dark:hover:border-primary/30 transition-all shadow-md dark:shadow-xl">
                <Shield className="w-6 h-6 text-amber-600 dark:text-primary shrink-0" />
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1 tracking-tight">Quality Control</h4>
                  <p className="text-slate-500 dark:text-gray-300 text-xs font-normal">Rigorous 24-step testing process.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 hover:border-amber-400 dark:hover:border-primary/30 transition-all shadow-md dark:shadow-xl">
                <Zap className="w-6 h-6 text-amber-600 dark:text-primary shrink-0" />
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1 tracking-tight">High Efficiency</h4>
                  <p className="text-slate-500 dark:text-gray-300 text-xs font-normal">Automated assembly lines.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-amber-500/10 dark:bg-primary/20 blur-3xl rounded-full opacity-50 z-0" />
            <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 shadow-2xl">
              <Image 
                src="/assets/factory_showcase_1778229216901.png" 
                alt="Factory Showcase" 
                width={800} 
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white/90 dark:bg-[#12131A]/90 backdrop-blur-xl border border-slate-200 dark:border-white/20 p-6 rounded-3xl z-20 shadow-2xl hidden md:block">
              <div className="text-3xl font-black text-amber-600 dark:text-primary font-mono mb-1">20,000+</div>
              <div className="text-slate-800 dark:text-white text-xs font-bold uppercase tracking-widest font-mono">Sq. Ft. Facility</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
