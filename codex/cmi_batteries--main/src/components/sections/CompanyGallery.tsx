"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ImageIcon, Video, Calendar, MapPin, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryMedia {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string | null;
  thumbnailUrl?: string | null;
  isCover: boolean;
  sortOrder: number;
}

interface GalleryEvent {
  id: string;
  name: string;
  category: string;
  eventDate: Date;
  location: string | null;
  description: string | null;
  isFeatured: boolean;
  media: GalleryMedia[];
}

export default function CompanyGallery({ events }: { events: GalleryEvent[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return ["All", ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events;
    return events.filter(e => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const handleOpenLightbox = (event: GalleryEvent) => {
    setSelectedEvent(event);
    setCurrentMediaIndex(0);
  };

  const handleCloseLightbox = () => {
    setSelectedEvent(null);
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEvent) {
      setCurrentMediaIndex((prev) => (prev + 1) % selectedEvent.media.length);
    }
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEvent) {
      setCurrentMediaIndex((prev) => (prev - 1 + selectedEvent.media.length) % selectedEvent.media.length);
    }
  };

  const VideoPreview = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    return (
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      />
    );
  };

  return (
    <section className="py-24 bg-[#050505] relative min-h-screen">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-heading font-bold uppercase tracking-[0.3em] text-[10px] mb-4 inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full"
          >
            Featured Events
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter mb-6 uppercase"
          >
            Gallery <span className="text-primary">Showcase</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg leading-relaxed"
          >
            Explore our premium lithium battery solutions, technical highlights, and trusted manufacturing excellence.
          </motion.p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(category => (
               <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  selectedCategory === category 
                    ? "bg-primary text-black font-bold" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32 auto-rows-[350px]">
          {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => {
            const coverMedia = event.media.find(m => m.isCover) || event.media[0];
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 8) * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                onClick={() => handleOpenLightbox(event)}
                className={cn(
                  "group relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 cursor-pointer",
                  "sm:col-span-2 sm:row-span-2"
                )}
              >
                {/* Media */}
                <div className="absolute inset-0 z-0 bg-[#111]">
                  {coverMedia ? (
                    coverMedia.mediaType === "VIDEO" ? (
                      coverMedia.url.includes("youtube.com") || coverMedia.url.includes("youtu.be") ? (
                        <Image
                          src={coverMedia.thumbnailUrl || "/"}
                          alt={event.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <VideoPreview src={coverMedia.url} />
                      )
                    ) : (
                      <Image
                        src={coverMedia.url}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end pointer-events-none">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 border border-primary/20 rounded-md inline-block">
                        {event.category}
                      </span>
                      {event.media.length > 1 && (
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md inline-flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {event.media.length}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-white leading-tight text-3xl">
                      {event.name}
                    </h3>
                  </div>
                </div>

                {/* Premium Glow & Shine */}
                <div className="absolute inset-0 border-2 border-primary/0 rounded-[2rem] group-hover:border-primary/30 group-hover:shadow-[0_0_30px_rgba(250,255,0,0.1)] transition-all duration-500 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              No gallery events found.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (65 / 35 Split) */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex p-4 md:p-10 items-center justify-center"
            onClick={handleCloseLightbox}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-[110]"
              onClick={handleCloseLightbox}
            >
              <X className="w-6 h-6" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-7xl max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden flex flex-col lg:flex-row relative z-[105]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left 65% (Media Viewer) */}
              <div className="w-full lg:w-[65%] bg-black relative flex flex-col">
                <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                  {selectedEvent.media.length > 0 ? (
                    <>
                      {selectedEvent.media[currentMediaIndex].mediaType === "IMAGE" ? (
                        <Image
                          src={selectedEvent.media[currentMediaIndex].url}
                          alt={selectedEvent.name}
                          fill
                          className="object-contain"
                          priority
                        />
                      ) : (
                        selectedEvent.media[currentMediaIndex].url.includes("youtube.com") || selectedEvent.media[currentMediaIndex].url.includes("youtu.be") ? (
                           <iframe 
                            src={`${selectedEvent.media[currentMediaIndex].url}?autoplay=1&mute=1`} 
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video 
                            src={selectedEvent.media[currentMediaIndex].url} 
                            controls 
                            autoPlay 
                            className="w-full h-full max-h-[70vh] object-contain outline-none" 
                          />
                        )
                      )}

                      {/* Navigation Arrows */}
                      {selectedEvent.media.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevMedia}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all z-[110]"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNextMedia}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all z-[110]"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                     <div className="text-gray-500">No media available for this event.</div>
                  )}
                </div>
                
                {/* Thumbnail Navigation */}
                {selectedEvent.media.length > 1 && (
                  <div className="h-24 bg-[#111] border-t border-white/10 flex items-center gap-2 px-4 overflow-x-auto">
                    {selectedEvent.media.map((m, idx) => (
                      <button
                        key={m.id || m.url}
                        onClick={() => setCurrentMediaIndex(idx)}
                        className={cn(
                          "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-black",
                          currentMediaIndex === idx ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                      >
                        {m.mediaType === "IMAGE" || m.thumbnailUrl ? (
                          <Image src={m.thumbnailUrl || m.url} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        {m.mediaType === "VIDEO" && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                             <Video className="w-4 h-4 text-white" />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 35% (Info Viewer) */}
              <div className="w-full lg:w-[35%] bg-[#0A0A0A] p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto max-h-[50vh] lg:max-h-none border-l border-white/10">
                <div>
                  <div className="text-primary font-bold tracking-widest text-xs uppercase mb-2">
                    {selectedEvent.category}
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-white mb-4">
                    {selectedEvent.name}
                  </h2>
                  <div className="flex flex-col gap-3 text-gray-400 text-sm">
                    {selectedEvent.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(selectedEvent.eventDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {selectedEvent.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px w-full bg-white/10" />
                
                {selectedEvent.description ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <AlignLeft className="w-4 h-4 text-primary" />
                      About this Event
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm italic">
                    No description provided.
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
