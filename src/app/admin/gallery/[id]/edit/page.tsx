import { db } from "@/lib/db";
import GalleryEventForm from "@/components/admin/GalleryEventForm";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import DeleteGalleryEventButton from "./DeleteGalleryEventButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryEventPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  
  const event = await db.galleryEvent.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Edit: {event.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Update event details and manage photos.</p>
        </div>
        <DeleteGalleryEventButton eventId={event.id} />
      </div>
      
      <GalleryEventForm initialData={event} />
    </div>
  );
}
