"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const HERO_SLIDES = [
  { src: "/assets/slides/dealers (4).png", name: "Dealers" },
  { src: "/assets/slides/products (3).jpeg", name: "Products" },
  { src: "/assets/slides/services.jpg", name: "Services" }
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
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100svh" }}
    >
      {/* Full-screen Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={HERO_SLIDES[currentImageIndex].src}
            alt={HERO_SLIDES[currentImageIndex].name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay at top for navbar readability */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent z-10 pointer-events-none" />

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows — vertically centered */}
      <button
        onClick={prevSlide}
        className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-4 bg-black/50 hover:bg-primary text-white hover:text-black transition-colors rounded-sm backdrop-blur-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-4 bg-black/50 hover:bg-primary text-white hover:text-black transition-colors rounded-sm backdrop-blur-md"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
      </button>

      {/* Slide dots indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImageIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentImageIndex ? "bg-primary w-6" : "bg-white/40"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none">
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400">Scroll</span>
      </div>
    </section>
  );
}
