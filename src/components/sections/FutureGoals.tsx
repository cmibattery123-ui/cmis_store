"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Globe, Leaf, TrendingUp } from "lucide-react";

const GOALS = [
  {
    title: "Global Reach",
    desc: "Expanding our distribution network across India and key international export markets.",
    icon: Globe,
  },
  {
    title: "Eco-Innovation",
    desc: "Advancing non-toxic, recyclable lithium iron phosphate chemistries for minimal environmental impact.",
    icon: Leaf,
  },
  {
    title: "Smart Telemetry",
    desc: "Developing next-generation BMS systems with real-time health and charge telemetry.",
    icon: Target,
  },
  {
    title: "Quality Leadership",
    desc: "Expanding domestic production capacity with automated cell matching and quality assurance.",
    icon: TrendingUp,
  },
];

export default function FutureGoals() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#07080C] relative overflow-hidden transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold">
            Strategic Vision
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Our Vision & Goals
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-normal text-base">
            Where Chinna Mayil Industries is heading as we expand manufacturing and clean energy solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GOALS.map((goal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/15 hover:border-amber-400 dark:hover:border-primary/50 transition-all shadow-md dark:shadow-xl group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <goal.icon className="w-6 h-6 text-amber-600 dark:text-primary" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors">{goal.title}</h4>
              <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-normal">{goal.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
