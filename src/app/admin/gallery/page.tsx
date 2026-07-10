import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ImageIcon, Pencil, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

export default async function AdminGalleryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const events = await db.galleryEvent.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      media: {
        where: { isCover: true },
        take: 1,
      },
      _count: {
        select: { media: true }
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Gallery Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage public gallery events and photos.</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="flex items-center gap-2 bg-primary text-black font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/50 border-b border-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium w-12"></th>
                <th className="px-6 py-4 font-medium">Event</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Photos</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-gray-600">
                    <GripVertical className="w-4 h-4 cursor-grab" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 relative shrink-0">
                        {event.media[0] ? (
                          event.media[0].thumbnailUrl || event.media[0].url ? (
                            <Image src={event.media[0].thumbnailUrl || event.media[0].url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{event.name}</p>
                        {event.location && <p className="text-xs text-gray-500">{event.location}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{event.category}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {format(new Date(event.eventDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {event.isPublished ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Published</span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">Draft</span>
                      )}
                      {event.isFeatured && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {event._count.media}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/gallery/${event.id}/edit`}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {/* We could add an inline delete button here, but for brevity, relying on edit page or a client component if needed */}
                    </div>
                  </td>
                </tr>
              ))}
              
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No gallery events found. Click "Add Event" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
