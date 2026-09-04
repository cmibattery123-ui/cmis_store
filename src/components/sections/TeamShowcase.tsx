"use client";

import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";

const TEAM = {
  founders: [
    {
      name: "Shri. THANGARAJ CHINNARAJ",
      role: "Founder & Chairman",
      image: "/assets/Members/Shri. C. THANGARAJ.jpeg",
      bio: "Visionary leader driving innovation, growth, and excellence with a future-focused approach.",
    },
    {
      name: "Dr. BABU RAJAGOPAL",
      role: "Managing Director",
      image: "/assets/Members/WhatsApp Image 2026-05-08 at 3.25.42 PM.jpeg",
      bio: "Driving innovation, leadership, and strategic growth with a vision for excellence.",
    },
    {
      name: "Mr. G. MOHANRAJ",
      role: "Factory Manager",
      image: "/assets/Members/mr.mohan.jpeg",
      bio: "42+ years of trusted excellence in delivering high-performance lithium battery solutions.",
    },
  ],
};

const TeamMemberCard = ({ member, isLarge = false }: { member: any; isLarge?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative group ${isLarge ? "col-span-1 md:col-span-1 lg:col-span-1" : ""}`}
    >
      <div className={`relative z-10 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0C0D14] h-full flex flex-col items-center text-center transition-all duration-300 hover:border-slate-300 dark:hover:border-white/30 shadow-md dark:shadow-xl`}>
        {/* Profile Image Container */}
        <div className={`relative mb-5 ${isLarge ? "w-36 h-36" : "w-28 h-28"} rounded-full p-1 border-2 border-slate-200 dark:border-white/20 group-hover:border-amber-500 dark:group-hover:border-primary transition-colors duration-300`}>
          <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100 dark:bg-neutral-800">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <User size={isLarge ? 56 : 40} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1 tracking-tight">
          {member.name}
        </h3>
        <p className="text-amber-600 dark:text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          {member.role}
        </p>

        {member.bio && (
          <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-normal">
            {member.bio}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function TeamShowcase() {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold"
          >
            Leadership & Management
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Leadership Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-gray-400 text-base md:text-lg leading-relaxed font-normal"
          >
            The engineering and management leadership guiding Chinna Mayil Industries and Perfect Batteries.
          </motion.p>
        </div>

        {/* Founders & Directors */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest font-mono">Management Team</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-400/50 dark:from-primary/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.founders.map((member, i) => (
              <TeamMemberCard key={i} member={member} isLarge={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
