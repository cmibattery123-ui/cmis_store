"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HERO_SLIDES = [
  {
    src: "/assets/slides/dealers (4).png",
    eyebrow: "Chinna Mayil Industries • Since 1982",
    title: "High-performance lithium. Engineered to last.",
    subtitle: "Over 42 years of Coimbatore engineering excellence powering 500+ authorized dealers across India.",
    ctaText: "Explore Products",
    ctaLink: "/products",
    secondaryText: "Become a Dealer",
    secondaryLink: "/auth/dealer-register",
  },
  {
    src: "/assets/slides/products (3).jpeg",
    eyebrow: "Next-Generation LiFePO4",
    title: "Built for 5,000+ deep cycles.",
    subtitle: "Zero-maintenance, ultra-durable battery packs designed for solar, residential inverters, and heavy-duty power.",
    ctaText: "View Battery Models",
    ctaLink: "/products",
    secondaryText: "Check Warranty",
    secondaryLink: "/warranty",
  },
  {
    src: "/assets/slides/services.jpg",
    eyebrow: "ISO 9001:2015 Certified Plant",
    title: "Precision testing. Guaranteed reliability.",
    subtitle: "Direct factory support, 5-year replacement warranty, and pan-India dispatch from our Coimbatore manufacturing base.",
    ctaText: "Engineering Services",
    ctaLink: "/services",
    secondaryText: "Contact Sales",
    secondaryLink: "/contact",
  },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[currentImageIndex];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black text-white"
      style={{ minHeight: "100svh", height: "100svh" }}
    >
      {/* Full-screen Background Slider with Apple-style smooth crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={currentSlide.src}
            alt={currentSlide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[0.6] contrast-[1.05]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle vignettes and gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Main Hero Content - Apple Typography & Sizing */}
      <div className="relative z-20 container mx-auto px-6 sm:px-10 md:px-16 h-full flex flex-col justify-center">
        <div className="max-w-3xl pt-24 sm:pt-28">
          {/* Eyebrow badge */}
          <motion.div
            key={`eyebrow-${currentImageIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 text-xs font-semibold text-primary mb-5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{currentSlide.eyebrow}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            key={`title-${currentImageIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.06] text-white"
          >
            {currentSlide.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            key={`sub-${currentImageIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 text-base sm:text-lg md:text-xl text-[#D2D2D7] font-normal leading-relaxed max-w-2xl"
          >
            {currentSlide.subtitle}
          </motion.p>

          {/* Apple Pill Action Buttons */}
          <motion.div
            key={`cta-${currentImageIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            <Link
              href={currentSlide.ctaLink}
              className="inline-flex items-center justify-center gap-2 bg-primary text-black font-semibold text-sm px-8 py-4 rounded-full hover:bg-yellow-300 transition-all shadow-lg active:scale-[0.98]"
            >
              <span>{currentSlide.ctaText}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href={currentSlide.secondaryLink}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-full transition-all active:scale-[0.98]"
            >
              <span>{currentSlide.secondaryText}</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Apple-style Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Pill Dots Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImageIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentImageIndex ? "bg-primary w-8" : "bg-white/40 hover:bg-white/70 w-2"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
