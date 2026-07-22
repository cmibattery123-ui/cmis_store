import GalleryEventForm from "@/components/admin/GalleryEventForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewGalleryEventPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Add Gallery Event</h1>
        <p className="text-sm text-gray-400 mt-1">Create a new event and upload photos.</p>
      </div>
      <GalleryEventForm />
    </div>
  );
}
