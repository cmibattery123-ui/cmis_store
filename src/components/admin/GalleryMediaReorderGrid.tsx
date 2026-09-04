"use client";

import React from "react";
import Image from "next/image";
import { X, GripVertical, Video } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export interface GalleryMedia {
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string;
  thumbnailUrl?: string;
  isCover: boolean;
  sortOrder: number;
}

interface GalleryMediaReorderGridProps {
  media: GalleryMedia[];
  onDragEnd: (result: DropResult) => void;
  onSetCover: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function GalleryMediaReorderGrid({
  media,
  onDragEnd,
  onSetCover,
  onRemove,
}: GalleryMediaReorderGridProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="gallery-media" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {media.map((m, index) => (
              <Draggable key={m.url} draggableId={m.url} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden group bg-slate-100 dark:bg-[#111] border",
                      m.isCover ? "border-amber-500 dark:border-primary ring-2 ring-amber-500/30 dark:ring-primary/30" : "border-slate-200 dark:border-white/10",
                      snapshot.isDragging && "shadow-2xl shadow-primary/20 z-50 ring-2 ring-primary"
                    )}
                  >
                    {m.mediaType === "IMAGE" ? (
                      <Image
                        src={m.url}
                        alt="Gallery media"
                        fill
                        className="object-cover"
                      />
                    ) : m.thumbnailUrl ? (
                      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover opacity-80"
                          onError={(e) => {
                            // Hide broken image thumbnail if unavailable
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-xl">
                            <Video className="w-5 h-5 text-amber-400 dark:text-primary ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-4 gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                          <Video className="w-5 h-5 text-amber-400 dark:text-primary ml-0.5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Video</span>
                      </div>
                    )}

                    {m.isCover && (
                      <div className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest z-10 font-mono">
                        Cover
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                      <div {...provided.dragHandleProps} className="p-2 cursor-grab text-white/70 hover:text-white">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      {!m.isCover && m.mediaType === "IMAGE" && (
                        <button
                          type="button"
                          onClick={() => onSetCover(index)}
                          className="text-xs font-medium text-white bg-white/20 hover:bg-white/40 px-3 py-1 rounded transition-colors cursor-pointer"
                        >
                          Set Cover
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 text-white/50 hover:text-red-400 transition-colors p-1 bg-black/50 rounded-md cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
