"use client";

import React from "react";
import { motion } from "framer-motion";
import { Factory, Shield, Zap, Settings } from "lucide-react";
import Image from "next/image";

export default function FactoryShowcase() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <Factory className="w-3 h-3" /> Manufacturing Excellence
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
              State-of-the-Art <br /> <span className="text-primary">Factory Showcase</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our manufacturing facility in Madukkarai, Coimbatore, is equipped with the latest technology for lithium battery assembly, testing, and quality assurance.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                <Shield className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Quality Control</h4>
                  <p className="text-gray-500 text-xs">Rigorous 24-step testing process.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                <Zap className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">High Efficiency</h4>
                  <p className="text-gray-500 text-xs">Automated assembly lines.</p>
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
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 z-0" />
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src="/assets/factory_showcase_1778229216901.png" 
                alt="Factory Showcase" 
                width={800} 
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl z-20 shadow-2xl hidden md:block">
              <div className="text-3xl font-bold text-primary mb-1">20,000+</div>
              <div className="text-white text-xs font-bold uppercase tracking-widest">Sq. Ft. Facility</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
