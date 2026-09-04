import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { invalidateEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET(request?: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const events = await db.galleryEvent.findMany({
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { eventDate: "desc" },
    });

    return apiSuccess(events);
  } catch (error) {
    console.error("[admin_gallery_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const body = await request.json();
    const { name, title, category, description, eventDate, location, isPublished, isActive, sortOrder, media, images } = body;

    const eventName = name || title;
    if (!eventName || !eventDate) {
      return apiError("Event name and date are required", 400);
    }

    const rawMediaList = media || images || [];

    const event = await db.galleryEvent.create({
      data: {
        name: eventName,
        category: category || "General",
        description,
        eventDate: new Date(eventDate),
        location,
        isPublished: isPublished ?? isActive ?? true,
        sortOrder: sortOrder ?? 0,
        media: {
          create: rawMediaList.map((m: any, idx: number) => ({
            mediaType: m.mediaType || (m.url?.includes("youtube") || m.url?.includes("vimeo") || m.url?.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
            url: m.url,
            publicId: m.publicId || `gallery/${Date.now()}-${idx}`,
            thumbnailUrl: m.thumbnailUrl || (m.mediaType === "VIDEO" && m.publicId?.startsWith("youtube:") ? `https://img.youtube.com/vi/${m.publicId.replace("youtube:", "")}/hqdefault.jpg` : undefined),
            isCover: m.isCover ?? idx === 0,
            sortOrder: m.sortOrder ?? idx,
          })),
        },
        images: {
          create: rawMediaList.map((m: any, idx: number) => ({
            url: m.url,
            publicId: m.publicId || `gallery/${Date.now()}-${idx}`,
            isCover: m.isCover ?? idx === 0,
            sortOrder: m.sortOrder ?? idx,
          })),
        },
      },
      include: { media: true, images: true },
    });

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("gallery");

    return apiSuccess(event, 201);
  } catch (error) {
    console.error("[admin_gallery_post]", error);
    return apiError("Internal server error", 500);
  }
}
