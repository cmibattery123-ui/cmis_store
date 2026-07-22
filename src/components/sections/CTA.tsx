"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right scale-110" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-[0_0_100px_rgba(250,255,0,0.2)]">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="space-y-6 text-black relative z-10 max-w-xl text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-heading font-black leading-tight uppercase tracking-tighter">
              Ready to Upgrade <br /> to the Future?
            </h2>
            <p className="text-black/70 font-medium text-lg leading-relaxed">
              Join our network of 500+ dealers or request a custom quote for your industrial requirements today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/contact" className="inline-flex items-center justify-center bg-black text-primary hover:bg-black/90 font-bold h-14 px-8 rounded-full transition-colors">
                Get a Quote <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center border-2 border-black/20 hover:bg-black/5 text-black font-bold h-14 px-8 rounded-full transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="relative group cursor-pointer hidden lg:block">
            <div className="absolute inset-0 bg-black blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-48 h-48 rounded-full bg-black flex items-center justify-center border-[8px] border-black/10 shadow-2xl">
              <Zap className="w-20 h-20 text-primary fill-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                <MessageSquare className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
