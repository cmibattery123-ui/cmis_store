"use client";

import React from "react";
import GalleryEventForm from "@/components/admin/GalleryEventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewGalleryEventPage() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-white max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Add Gallery Event</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Create a new event and upload photos.</p>
        </div>
        <Link
          href="/admin/gallery"
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
      </div>
      <GalleryEventForm />
    </div>
  );
}
