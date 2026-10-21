import type { Metadata } from "next";
import Footer from "@/components/shared/Footer";
import CompanyGallery from "@/components/sections/CompanyGallery";
import { db } from "@/lib/db";
import { DEFAULT_GALLERY_EVENTS } from "@/lib/default-data";

export const metadata: Metadata = {
  title: "Media & Event Gallery | Chinna Mayil Industries — Perfect Batteries",
  description:
    "Explore our advanced manufacturing cleanroom, lithium cell testing laboratory, dealer summits, and product milestone gallery in Coimbatore.",
};

async function getInitialEvents() {
  try {
    const events = await db.galleryEvent.findMany({
      where: { isPublished: true },
      orderBy: [
        { eventDate: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (events) {
      return events.map((e) => ({
        ...e,
        eventDate: e.eventDate.toISOString(),
      }));
    }
  } catch (err) {
    console.error("Failed to load initial gallery events:", err);
  }

  return DEFAULT_GALLERY_EVENTS;
}

export default async function GalleryPage() {
  const events = await getInitialEvents();

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <CompanyGallery initialEvents={events as any} />
      <Footer />
    </main>
  );
}
