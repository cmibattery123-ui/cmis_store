"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ImageIcon, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils/api";
import { toast } from "sonner";

export default function AdminGalleryPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const json = await res.json();
      if (res.ok && json.data) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error("Failed to load gallery events:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function togglePublish(id: string, currentPublished: boolean) {
    setUpdatingId(id);
    const nextStatus = !currentPublished;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextStatus ? "Event published" : "Event set to draft");
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isPublished: nextStatus } : e))
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Event deleted");
      loadEvents();
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Gallery Management</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Manage public gallery events and photos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadEvents()}
            className="p-2 rounded-xl bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-700 dark:text-gray-300"
            title="Refresh gallery"
            aria-label="Refresh gallery"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/gallery/new"
            className="flex items-center gap-2 bg-primary text-black font-mono font-bold uppercase text-xs px-4 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0C0D14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600 dark:text-primary" />
            Loading gallery events...
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-gray-500">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No gallery events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-transparent border-b border-slate-200 dark:border-white/10 text-xs uppercase font-mono font-bold text-slate-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Media</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {events.map((event) => {
                  const isPub = event.isPublished ?? event.isActive ?? true;
                  const eventTitle = event.name || event.title || "Untitled Event";
                  const mediaCount = (event.media?.length ?? 0) || (event.images?.length ?? 0);

                  return (
                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">{eventTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {event.category && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300">
                              {event.category}
                            </span>
                          )}
                          {event.location && <span className="text-xs text-slate-500 dark:text-gray-400">{event.location}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400 text-xs font-mono">{formatDate(event.eventDate)}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => togglePublish(event.id, isPub)}
                          disabled={updatingId === event.id}
                          title="Click to toggle published status"
                          className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            isPub
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-green-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-500/10 text-slate-600 dark:text-gray-400 border border-slate-500/20 hover:bg-slate-500/20"
                          }`}
                        >
                          {updatingId === event.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${isPub ? "bg-emerald-500" : "bg-slate-400"}`} />
                          )}
                          {isPub ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400 font-mono text-xs">{mediaCount} items</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/gallery/${event.id}/edit`}
                            className="text-slate-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-primary transition-colors p-1"
                            title="Edit Event"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            disabled={deletingId === event.id}
                            className="text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Delete Event"
                          >
                            {deletingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
