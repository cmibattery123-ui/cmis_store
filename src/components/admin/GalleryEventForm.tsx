"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle2, Video, Link as LinkIcon, Sparkles, Play } from "lucide-react";
import type { DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import type { GalleryMedia } from "./GalleryMediaReorderGrid";

const GalleryMediaReorderGrid = dynamic(
  () => import("./GalleryMediaReorderGrid"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 gap-2 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500 dark:text-primary" />
        <span>Loading gallery media…</span>
      </div>
    ),
  }
);


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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [uploadStageText, setUploadStageText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadWithProgress = (
    url: string,
    formData: FormData,
    onProgress: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ ok: true });
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network upload error"));
      xhr.send(formData);
    });
  };

  const uploadDirectToYouTube = (
    uploadUrl: string,
    file: File,
    onProgress: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ ok: true });
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error?.message || `YouTube stream upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`YouTube stream upload failed (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error during YouTube upload"));
      xhr.send(file);
    });
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadeddata = () => {
          video.currentTime = Math.min(1, (video.duration || 2) / 2);
        };

        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } else {
            URL.revokeObjectURL(url);
            resolve("");
          }
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve("");
        };
      } catch {
        resolve("");
      }
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const files = Array.from(e.target.files);
      const newMedia: GalleryMedia[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingFileName(file.name);
        setUploadProgress(0);
        setUploadStageText(`Preparing "${file.name}"...`);

        const isVideo = file.type.startsWith("video/");
        
        let finalMediaUrl = "";
        let finalThumbnailUrl: string | undefined = undefined;
        let finalPublicId: string | undefined = undefined;

        if (isVideo) {
          try {
            setUploadStageText(`Extracting video frame preview...`);
            const generatedFrame = await generateVideoThumbnail(file);
            if (generatedFrame) {
              finalThumbnailUrl = generatedFrame;
            }
          } catch (frameErr) {
            console.warn("[Video Frame Extraction]", frameErr);
          }
        }

        if (isVideo || true) {
          // Stream media payload to Archive.org (Internet Archive - Unlimited Free Storage)
          setUploadStageText(`Uploading "${file.name}" to Archive.org (Unlimited Storage)...`);
          try {
            const archiveFormData = new FormData();
            archiveFormData.append("file", file);
            archiveFormData.append("title", name || file.name.replace(/\.[^/.]+$/, ""));
            archiveFormData.append("description", description || "CMI Battery Event Media");

            const archiveJson = await uploadWithProgress(
              "/api/admin/gallery/archive-upload",
              archiveFormData,
              (percent) => {
                setUploadProgress(percent);
                if (percent === 100) {
                  setUploadStageText(`Processing & Saving on Archive.org...`);
                } else {
                  setUploadStageText(`Uploading to Archive.org: ${percent}%`);
                }
              }
            );

            if (archiveJson.data?.url) {
              finalMediaUrl = archiveJson.data.url;
              if (!finalThumbnailUrl) {
                finalThumbnailUrl = archiveJson.data.thumbnailUrl;
              }
              finalPublicId = archiveJson.data.itemId ? `archive:${archiveJson.data.itemId}` : undefined;
            } else if (archiveJson.error) {
              throw new Error(archiveJson.error);
            }
          } catch (archiveErr: any) {
            console.error("[Archive.org Upload Error]", archiveErr);
            throw new Error(archiveErr.message || "Failed to upload file to Archive.org");
          }
        }

        newMedia.push({
          mediaType: isVideo ? "VIDEO" : "IMAGE",
          url: finalMediaUrl,
          publicId: finalPublicId,
          thumbnailUrl: finalThumbnailUrl,
          isCover: media.length === 0 && newMedia.length === 0 && !isVideo,
          sortOrder: media.length + newMedia.length,
        });
      }
      
      setMedia((prev) => [...prev, ...newMedia]);
    } catch (err: any) {
      setError(err.message || "Failed to upload media");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setUploadingFileName(null);
      setUploadStageText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
    if (media[index].mediaType !== "IMAGE") return;
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

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">Event Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="e.g. Annual Dealer Meet"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">Category *</label>
            <div className="flex gap-2">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm"
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
                className="w-full mt-2 bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm"
                placeholder="Enter custom category"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">Event Date *</label>
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="e.g. Coimbatore, TN"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-amber-500 dark:focus:border-primary focus:outline-none transition-colors text-sm resize-none"
            placeholder="Detailed description of the event..."
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200 dark:border-white/10">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              isPublished ? "bg-primary border-primary" : "border-slate-300 dark:border-white/20 group-hover:border-primary/50"
            )}>
              {isPublished && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-slate-900 dark:text-white text-sm font-medium">Published</span>
            <input type="checkbox" className="hidden" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-colors",
              isFeatured ? "bg-primary border-primary" : "border-slate-300 dark:border-white/20 group-hover:border-primary/50"
            )}>
              {isFeatured && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-slate-900 dark:text-white text-sm font-medium">Featured</span>
            <input type="checkbox" className="hidden" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          </label>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">Event Media</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">Images (max 5MB) & Videos (max 256GB / YouTube max limit). First image is cover.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-amber-500/10 dark:bg-primary/10 text-amber-600 dark:text-primary hover:bg-amber-500/20 dark:hover:bg-primary/20 border border-amber-500/20 dark:border-primary/20 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
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

        {isUploading && uploadProgress !== null && (
          <div className="bg-slate-50 dark:bg-[#12131A] border border-amber-500/30 dark:border-primary/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-700 dark:text-gray-300 font-medium truncate max-w-[75%] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 dark:text-primary" />
                {uploadStageText || (uploadingFileName ? `Uploading "${uploadingFileName}"...` : "Uploading media...")}
              </span>
              <span className="text-amber-600 dark:text-primary font-bold">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 dark:from-primary dark:to-yellow-300 h-full transition-all duration-200 ease-out rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {media.length > 0 ? (
          <GalleryMediaReorderGrid
            media={media}
            onDragEnd={onDragEnd}
            onSetCover={setAsCover}
            onRemove={removeMediaItem}
          />
        ) : (
          <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-400 dark:text-gray-500 text-sm">
            No media added yet. Click &quot;Upload Media&quot; above.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs uppercase font-mono hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase font-mono hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,255,0,0.2)] cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : null}
          {initialData ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  );
}
