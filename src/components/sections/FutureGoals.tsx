"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Globe, Leaf, TrendingUp } from "lucide-react";

const GOALS = [
  {
    title: "Global Reach",
    desc: "Expanding our distribution network beyond India to international markets.",
    icon: Globe,
  },
  {
    title: "Eco-Innovation",
    desc: "Developing 100% recyclable battery technology to reduce carbon footprint.",
    icon: Leaf,
  },
  {
    title: "Smart Storage",
    desc: "Integrating IoT and AI for real-time battery health monitoring.",
    icon: Target,
  },
  {
    title: "Market Leadership",
    desc: "Becoming the #1 trusted brand for lithium solutions in South Asia.",
    icon: TrendingUp,
  },
];

export default function FutureGoals() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white">
            Future Goals
          </h2>
          <p className="text-gray-400">
            Our vision for the next decade as we continue to push the boundaries of energy storage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {GOALS.map((goal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:bg-white/[0.08] group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <goal.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-3">{goal.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{goal.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
