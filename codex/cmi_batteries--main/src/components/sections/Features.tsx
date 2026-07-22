"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Droplets, Gauge, Leaf, Award } from "lucide-react";

const FEATURES = [
  {
    title: "5000+ Charge Cycles",
    description: "Built to last with high-grade lithium cells that outperform traditional lead-acid batteries by 5x.",
    icon: Zap,
  },
  {
    title: "100% Waterproof",
    description: "IP67 rated protection ensures your power remains stable even in the most extreme weather conditions.",
    icon: Droplets,
  },
  {
    title: "95% Efficiency",
    description: "Maximum energy retention with minimal discharge, providing more power for every charge cycle.",
    icon: Gauge,
  },
  {
    title: "Eco-Friendly",
    description: "Clean energy solutions that reduce carbon footprint and are 100% recyclable.",
    icon: Leaf,
  },
  {
    title: "42 Years Excellence",
    description: "Trust built over four decades of manufacturing precision and innovation in Coimbatore.",
    icon: Award,
  },
  {
    title: "Safer Design",
    description: "Advanced BMS (Battery Management System) for over-voltage and thermal protection.",
    icon: Shield,
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-[#080808] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-primary font-heading font-bold uppercase tracking-widest text-sm">Engineered Superiority</h2>
          <h3 className="text-4xl md:text-5xl font-heading font-bold text-white">Why Perfect Lithium?</h3>
          <p className="text-gray-400">Our batteries aren't just products; they're the result of 42 years of engineering evolution and a commitment to sustainable power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/[0.08]"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-3">{feature.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
