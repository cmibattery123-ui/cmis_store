import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { invalidateEdgeCache } from "@/lib/edge-cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const event = await db.galleryEvent.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) return apiError("Event not found", 404);
    return apiSuccess(event);
  } catch (error) {
    console.error("[admin_gallery_id_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const body = await request.json();
    const { name, title, category, description, eventDate, location, isPublished, isActive, sortOrder, media, images } = body;

    const eventName = name || title;

    const event = await db.galleryEvent.update({
      where: { id },
      data: {
        ...(eventName && { name: eventName }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(location !== undefined && { location }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isActive !== undefined && { isPublished: isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    const rawMediaList = media || images;
    if (rawMediaList && Array.isArray(rawMediaList)) {
      await db.galleryMedia.deleteMany({ where: { eventId: id } });
      await db.galleryImage.deleteMany({ where: { eventId: id } });

      await db.galleryMedia.createMany({
        data: rawMediaList.map((m: any, idx: number) => ({
          eventId: id,
          mediaType: m.mediaType || (m.url?.includes("youtube") || m.url?.includes("vimeo") || m.url?.endsWith(".mp4") ? "VIDEO" : "IMAGE"),
          url: m.url,
          publicId: m.publicId || `gallery/${Date.now()}-${idx}`,
          thumbnailUrl: m.thumbnailUrl || (m.mediaType === "VIDEO" && m.publicId?.startsWith("youtube:") ? `https://img.youtube.com/vi/${m.publicId.replace("youtube:", "")}/hqdefault.jpg` : undefined),
          isCover: m.isCover ?? idx === 0,
          sortOrder: m.sortOrder ?? idx,
        })),
      });

      await db.galleryImage.createMany({
        data: rawMediaList.map((m: any, idx: number) => ({
          eventId: id,
          url: m.url,
          publicId: m.publicId || `gallery/${Date.now()}-${idx}`,
          isCover: m.isCover ?? idx === 0,
          sortOrder: m.sortOrder ?? idx,
        })),
      });
    }

    const updated = await db.galleryEvent.findUnique({
      where: { id },
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("gallery");

    return apiSuccess(updated);
  } catch (error) {
    console.error("[admin_gallery_id_put]", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    await db.galleryMedia.deleteMany({ where: { eventId: id } });
    await db.galleryImage.deleteMany({ where: { eventId: id } });
    await db.galleryEvent.delete({ where: { id } });

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("gallery");

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("[admin_gallery_id_delete]", error);
    return apiError("Internal server error", 500);
  }
}
