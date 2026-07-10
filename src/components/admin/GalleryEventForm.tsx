"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, X, Upload, Star, GripVertical, CheckCircle2, Video, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface GalleryMedia {
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  publicId?: string;
  thumbnailUrl?: string;
  isCover: boolean;
  sortOrder: number;
}

interface GalleryEventFormProps {
  initialData?: any;
}

const PREDEFINED_CATEGORIES = [
  "Events",
  "Products",
  "Behind the Scenes",
  "Media",
  "Other"
];

export default function GalleryEventForm({ initialData }: GalleryEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCat = initialData?.category || "";
  const [categoryType, setCategoryType] = useState(
    PREDEFINED_CATEGORIES.includes(initialCat) || !initialCat ? initialCat : "Other"
  );
  const [customCategory, setCustomCategory] = useState(
    PREDEFINED_CATEGORIES.includes(initialCat) ? "" : initialCat
  );

  const [name, setName] = useState(initialData?.name || "");
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  
  const [media, setMedia] = useState<GalleryMedia[]>(
    (initialData?.media?.length ? initialData.media : initialData?.images)?.map((m: any) => ({
      mediaType: m.mediaType || "IMAGE",
      url: m.url,
      publicId: m.publicId,
      thumbnailUrl: m.thumbnailUrl,
      isCover: m.isCover,
      sortOrder: m.sortOrder,
    })) || []
  );

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [showExternalInput, setShowExternalInput] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const files = Array.from(e.target.files);
      const newMedia: GalleryMedia[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "cmi-batteries/gallery");
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }
        
        const data = await res.json();
        const isVideo = file.type.startsWith("video/");
        
        newMedia.push({
          mediaType: isVideo ? "VIDEO" : "IMAGE",
          url: data.data.url,
          publicId: data.data.publicId,
          thumbnailUrl: isVideo ? data.data.url.replace(/\.mp4$/, ".jpg") : undefined,
          isCover: media.length === 0 && newMedia.length === 0 && !isVideo,
          sortOrder: media.length + newMedia.length,
        });
      }
      
      setMedia((prev) => [...prev, ...newMedia]);
    } catch (err: any) {
      setError(err.message || "Failed to upload media");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddExternalVideo = () => {
    if (!externalVideoUrl) return;
    
    let embedUrl = externalVideoUrl;
    let thumbnailUrl = "";
    
    // Simple youtube extraction
    if (externalVideoUrl.includes("youtube.com") || externalVideoUrl.includes("youtu.be")) {
      const match = externalVideoUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        thumbnailUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    setMedia(prev => [
      ...prev,
      {
        mediaType: "VIDEO",
        url: embedUrl,
        thumbnailUrl,
        isCover: false,
        sortOrder: prev.length,
      }
    ]);
    setExternalVideoUrl("");
    setShowExternalInput(false);
  };

  const removeMediaItem = (index: number) => {
    setMedia((prev) => {
      const newMedia = [...prev];
      const removed = newMedia.splice(index, 1)[0];
      
      if (removed.isCover && newMedia.length > 0) {
        const firstImage = newMedia.find(m => m.mediaType === "IMAGE");
        if (firstImage) firstImage.isCover = true;
      }
      
      return newMedia.map((m, i) => ({ ...m, sortOrder: i }));
    });
  };

  const setAsCover = (index: number) => {
    if (media[index].mediaType !== "IMAGE") return; // Only images can be cover
    setMedia((prev) =>
      prev.map((m, i) => ({
        ...m,
        isCover: i === index,
      }))
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(media);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const newMedia = items.map((m, i) => ({ ...m, sortOrder: i }));
    setMedia(newMedia);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const finalCategory = categoryType === "Other" ? customCategory : categoryType;
      if (!finalCategory) throw new Error("Category is required");

      const url = initialData 
        ? `/api/admin/gallery/${initialData.id}`
        : `/api/admin/gallery`;
        
      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: finalCategory,
          eventDate,
          location,
          description,
          isFeatured,
          isPublished,
          media,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      
      router.push("/admin/gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Event Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="e.g. Annual Dealer Meet"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Category *</label>
            <div className="flex gap-2">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
              >
                <option value="">Select a category</option>
                {PREDEFINED_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {categoryType === "Other" && (
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                placeholder="Enter custom category"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Event Date *</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
              placeholder="e.g. Coimbatore, TN"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
            placeholder="Detailed description of the event..."
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              isPublished ? "bg-primary border-primary" : "border-white/20 group-hover:border-primary/50"
            )}>
              {isPublished && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-white text-sm">Published</span>
            <input type="checkbox" className="hidden" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              isFeatured ? "bg-primary border-primary" : "border-white/20 group-hover:border-primary/50"
            )}>
              {isFeatured && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-white text-sm">Featured</span>
            <input type="checkbox" className="hidden" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-heading font-bold text-white">Event Media</h3>
            <p className="text-gray-400 text-sm">Images (max 5MB) & Videos (max 20MB). First image is cover.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExternalInput(!showExternalInput)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              External Video
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Media
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaUpload}
              multiple
              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm"
              className="hidden"
            />
          </div>
        </div>

        {showExternalInput && (
          <div className="flex gap-2 items-center bg-[#111] p-3 rounded-xl border border-white/10">
            <input 
              type="url" 
              placeholder="YouTube or Vimeo URL" 
              value={externalVideoUrl}
              onChange={(e) => setExternalVideoUrl(e.target.value)}
              className="flex-1 bg-transparent text-white focus:outline-none px-2"
            />
            <button 
              type="button" 
              onClick={handleAddExternalVideo}
              className="px-4 py-1.5 bg-primary text-black font-medium rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        )}

        {media.length > 0 ? (
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
                            "relative aspect-square rounded-xl overflow-hidden group bg-[#111] border",
                            m.isCover ? "border-primary" : "border-white/10",
                            snapshot.isDragging && "shadow-2xl shadow-primary/20 z-50 ring-2 ring-primary"
                          )}
                        >
                          {m.mediaType === "IMAGE" || m.thumbnailUrl ? (
                            <Image src={m.thumbnailUrl || m.url} alt="Gallery media" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Video className="w-10 h-10 text-gray-500" />
                            </div>
                          )}
                          
                          {m.mediaType === "VIDEO" && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                <Video className="w-5 h-5 text-white ml-1" />
                              </div>
                            </div>
                          )}

                          {m.isCover && (
                            <div className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest z-10">
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
                                onClick={() => setAsCover(index)}
                                className="text-xs font-medium text-white bg-white/20 hover:bg-white/40 px-3 py-1 rounded transition-colors"
                              >
                                Set Cover
                              </button>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => removeMediaItem(index)}
                              className="absolute top-2 right-2 text-white/50 hover:text-red-400 transition-colors p-1 bg-black/50 rounded-md"
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
        ) : (
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500">
            No media added yet.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {initialData ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
