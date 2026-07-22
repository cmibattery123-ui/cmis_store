"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Construction } from "lucide-react";

interface DevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevelopmentModal({ isOpen, onClose }: DevelopmentModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden backdrop-blur-2xl"
          >
            {/* Animated Glow Accents */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all duration-300 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Icon & Message */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(250,255,0,0.2)]"
                >
                  <Construction className="w-10 h-10" />
                </motion.div>
                
                {/* Pulsing Zap Icon */}
                <motion.div 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border border-primary/50 flex items-center justify-center text-primary"
                >
                  <Zap className="w-4 h-4 fill-primary" />
                </motion.div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                  Online Ordering is <br />
                  <span className="text-primary uppercase tracking-widest text-lg md:text-xl">Under Development</span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                  We are currently fine-tuning our e-commerce experience to ensure the highest performance for our customers.
                </p>
              </div>

              {/* Progress indicator */}
              <div className="w-full bg-white/5 border border-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary/50 to-primary shadow-[0_0_10px_rgba(250,255,0,0.5)]"
                />
              </div>
              <div className="flex justify-between w-full text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                <span>Phase 2: Integration</span>
                <span>75% Complete</span>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full bg-primary text-black font-heading font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(250,255,0,0.2)] active:scale-95"
              >
                GOT IT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
