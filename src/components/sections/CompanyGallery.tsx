"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Video,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DefaultGalleryEvent } from "@/lib/default-data";

export default function CompanyGallery({
  initialEvents,
}: {
  initialEvents?: DefaultGalleryEvent[];
}) {
  const [events, setEvents] = useState<DefaultGalleryEvent[]>(
    initialEvents || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<DefaultGalleryEvent | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Sync with API
  useEffect(() => {
    let isMounted = true;
    async function loadGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && Array.isArray(data.data)) {
            setEvents(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery events:", err);
      }
    }
    loadGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return ["All", ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const handleOpenLightbox = (event: DefaultGalleryEvent, index = 0) => {
    setSelectedEvent(event);
    setCurrentMediaIndex(index);
  };

  const handleCloseLightbox = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleNextMedia = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedEvent && selectedEvent.media.length > 0) {
        setCurrentMediaIndex((prev) => (prev + 1) % selectedEvent.media.length);
      }
    },
    [selectedEvent]
  );

  const handlePrevMedia = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedEvent && selectedEvent.media.length > 0) {
        setCurrentMediaIndex(
          (prev) => (prev - 1 + selectedEvent.media.length) % selectedEvent.media.length
        );
      }
    },
    [selectedEvent]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEvent) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowRight") handleNextMedia();
      if (e.key === "ArrowLeft") handlePrevMedia();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, handleCloseLightbox, handleNextMedia, handlePrevMedia]);

  return (
    <section className="bg-slate-50 dark:bg-[#07080C] relative min-h-screen text-slate-900 dark:text-white transition-colors duration-200">
      {/* Light-infused ambient background energy glows & grid */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/6 left-1/3 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/[0.04] dark:bg-white/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[600px] h-[600px] bg-slate-200/50 dark:bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

      {/* Spacious Hero Header */}
      <div className="relative pt-32 sm:pt-36 pb-16 px-4 md:px-8 border-b border-slate-200 dark:border-white/10 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 dark:bg-primary/10 border border-amber-500/20 dark:border-primary/20 rounded-full shadow-sm text-amber-700 dark:text-primary text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Factory & Events Gallery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Inside Perfect Batteries
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-300 text-base md:text-lg mt-3 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            A visual overview of our manufacturing facilities, assembly lines, dealer meets, and industry exhibitions.
          </motion.p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 pt-6">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              const count =
                category === "All"
                  ? events.length
                  : events.filter((e) => e.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-300 flex items-center gap-2 border cursor-pointer uppercase shadow-sm",
                    isSelected
                      ? "bg-primary text-black border-amber-400 dark:border-primary shadow-[0_0_20px_rgba(250,255,0,0.35)]"
                      : "bg-white dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                  )}
                >
                  <span>{category}</span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold",
                      isSelected ? "bg-black/20 text-black" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacious Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, idx) => {
            const coverMedia = event.media.find((m) => m.isCover) || event.media[0];

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                onClick={() => handleOpenLightbox(event)}
                className="group bg-white dark:bg-gradient-to-b dark:from-[#181924]/90 dark:to-[#0E0F16]/90 border border-slate-200 dark:border-white/15 rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:border-white/35 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1.5 backdrop-blur-xl"
              >
                {/* Cinematic Image Stage */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-black/60 overflow-hidden border-b border-slate-100 dark:border-white/10">
                  {coverMedia ? (
                    coverMedia.mediaType === "VIDEO" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {coverMedia.thumbnailUrl && (
                          <Image
                            src={coverMedia.thumbnailUrl}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          />
                        )}
                        <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                          <Video className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={coverMedia.url}
                        alt={event.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md border border-white/15 rounded-full text-yellow-300 dark:text-primary shadow">
                      {event.category}
                    </span>

                    {event.media.length > 1 && (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md border border-white/15 rounded-full text-white inline-flex items-center gap-1.5 shadow">
                        <Layers className="w-3 h-3 text-amber-400 dark:text-primary" />
                        {event.media.length} photos
                      </span>
                    )}
                  </div>
                </div>

                {/* Clean Content Area */}
                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-xl group-hover:text-amber-600 dark:group-hover:text-yellow-200 transition-colors leading-snug tracking-tight">
                      {event.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 line-clamp-3 leading-relaxed font-normal">
                      {event.description}
                    </p>
                  </div>

                  {/* Card Meta Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                      <span className="truncate font-medium">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-slate-500 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-primary shrink-0" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
            onClick={handleCloseLightbox}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 z-[120] cursor-pointer"
              title="Close (Esc)"
              aria-label="Close photo gallery"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-6xl bg-[#0c0c10] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Viewing Stage */}
              <div className="relative bg-black h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden p-4">
                {selectedEvent.media && selectedEvent.media.length > 0 ? (
                  selectedEvent.media[currentMediaIndex].mediaType === "IMAGE" ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedEvent.media[currentMediaIndex].url}
                        alt={selectedEvent.name}
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  ) : selectedEvent.media[currentMediaIndex].url.includes("youtube.com") ||
                    selectedEvent.media[currentMediaIndex].url.includes("youtu.be") ? (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <iframe
                        src={
                          selectedEvent.media[currentMediaIndex].url.includes("?")
                            ? `${selectedEvent.media[currentMediaIndex].url}&autoplay=1`
                            : `${selectedEvent.media[currentMediaIndex].url}?autoplay=1`
                        }
                        title={selectedEvent.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-2xl border-0 shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        src={selectedEvent.media[currentMediaIndex].url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )
                ) : (
                  <div className="text-gray-500">No media available.</div>
                )}

                {/* Left & Right Navigation Arrows */}
                {selectedEvent.media && selectedEvent.media.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all z-20 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all z-20 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Info Bar & Thumbnails */}
              <div className="p-6 md:p-8 bg-[#12131A] border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-y-auto">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-primary uppercase">
                      {selectedEvent.category}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(selectedEvent.eventDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {selectedEvent.location}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {selectedEvent.name}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Thumbnail Filmstrip */}
                {selectedEvent.media && selectedEvent.media.length > 1 && (
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedEvent.media.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMediaIndex(i)}
                        className={cn(
                          "relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                          currentMediaIndex === i
                            ? "border-primary scale-105 shadow-[0_0_12px_rgba(250,255,0,0.5)]"
                            : "border-transparent opacity-50 hover:opacity-100"
                        )}
                        aria-label={`View photo ${i + 1}`}
                      >
                        <Image
                          src={item.thumbnailUrl || item.url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
