"use client";

import React, { useState, useEffect, use } from "react";
import GalleryEventForm from "@/components/admin/GalleryEventForm";
import DeleteGalleryEventButton from "./DeleteGalleryEventButton";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditGalleryEventPage({ params }: PageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/gallery/${id}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setEvent(json.data);
        }
      } catch (err) {
        console.error("Failed to load gallery event:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-gray-400">
        <Loader2 className="w-8 h-8 text-amber-600 dark:text-primary animate-spin" />
        <span className="text-xs font-mono">Loading event...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-gray-400">
        <p>Gallery event not found.</p>
        <Link href="/admin/gallery" className="text-amber-600 dark:text-primary underline text-sm mt-2 inline-block">
          Return to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Edit: {event.title || event.name}</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Update event details and manage photos.</p>
        </div>
        <DeleteGalleryEventButton eventId={event.id} />
      </div>
      
      <GalleryEventForm initialData={event} />
    </div>
  );
}
