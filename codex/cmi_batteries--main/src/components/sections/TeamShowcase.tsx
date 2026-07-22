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

const TeamMemberCard = ({ member, isLarge = false, isFuturistic = false }: { member: any; isLarge?: boolean; isFuturistic?: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={`relative group ${isLarge ? "col-span-1 md:col-span-1 lg:col-span-1" : ""}`}
    >
      {/* Background Glow */}
      {isLarge && (
        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
      )}

      <div className={`relative z-10 p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl h-full flex flex-col items-center text-center transition-all duration-500 hover:border-primary/50 hover:bg-white/10 ${isLarge ? "py-10 border-primary/20 bg-primary/5 shadow-[0_0_40px_rgba(250,255,0,0.1)]" : ""}`}>

        {/* Glowing Border for Leaders */}
        {isLarge && (
          <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/30 animate-pulse pointer-events-none" />
        )}

        {/* Profile Image Container */}
        <div className={`relative mb-6 ${isLarge ? "w-40 h-40" : "w-32 h-32"} rounded-full p-1 border-2 ${isLarge ? "border-primary" : "border-white/20"} group-hover:border-primary transition-colors duration-500`}>
          <div className="w-full h-full rounded-full overflow-hidden relative bg-neutral-800">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover object-top transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={isLarge ? 64 : 48} />
              </div>
            )}
          </div>

          {/* Status Dot */}
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-primary rounded-full border-2 border-black animate-pulse" />
        </div>

        {/* Info */}
        <h3 className={`font-heading font-bold text-white mb-1 transition-colors group-hover:text-primary whitespace-nowrap tracking-tight ${isLarge ? "text-[clamp(0.875rem,2vw,1.25rem)]" : "text-[clamp(0.75rem,1.5vw,1rem)]"}`}>
          {member.name}
        </h3>
        <p className={`text-primary font-bold tracking-widest uppercase mb-4 ${isLarge ? "text-xs" : "text-[10px]"}`}>
          {member.role}
        </p>

        {member.bio && (
          <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
            "{member.bio}"
          </p>
        )}

        {/* Futuristic Corner Decorative Elements */}
        {isFuturistic && (
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
        )}
      </div>
    </motion.div>
  );
};

export default function TeamShowcase() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#050505]">
      {/* Background Particles/Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-heading font-bold uppercase tracking-widest text-xs px-4 py-2 bg-primary/10 border border-primary/20 rounded-full"
          >
            Our People
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter"
          >
            Meet the Team Behind <br /> Perfect Batteries
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            The people driving innovation, performance, and trusted battery technology at Chinna Mayil Industries.
          </motion.p>
        </div>

        {/* Founders & Directors */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-xl font-heading font-bold text-white uppercase tracking-widest">Management Team</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
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
