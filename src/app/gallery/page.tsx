import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CompanyGallery from "@/components/sections/CompanyGallery";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery | Inside Perfect Batteries",
  description: "Explore our state-of-the-art manufacturing facility and product showcase.",
};

export default async function GalleryPage() {
  const events = await db.galleryEvent.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { sortOrder: "asc" },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      <CompanyGallery events={events as any} />
      <Footer />
    </main>
  );
}
