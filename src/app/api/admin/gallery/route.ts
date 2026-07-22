import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const events = await db.galleryEvent.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(events);
  } catch (error) {
    console.error("[gallery_get]", error);
    return apiError("Failed to fetch gallery events", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const { name, category, eventDate, location, description, isFeatured, isPublished, images, media } = body;

    if (!name || !category || !eventDate) {
      return apiError("Name, category, and event date are required", 400);
    }

    const maxSortOrder = await db.galleryEvent.aggregate({
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    // Use media if provided, else fallback to images (for backwards compatibility if any frontend still uses it)
    const mediaToCreate = media || images || [];

    const event = await db.galleryEvent.create({
      data: {
        name,
        category,
        eventDate: new Date(eventDate),
        location,
        description,
        isFeatured: !!isFeatured,
        isPublished: isPublished !== false,
        sortOrder: nextSortOrder,
        media: {
          create: mediaToCreate.map((img: any, i: number) => ({
            mediaType: img.mediaType || "IMAGE",
            url: img.url,
            publicId: img.publicId,
            thumbnailUrl: img.thumbnailUrl,
            isCover: !!img.isCover,
            sortOrder: i,
          })),
        },
      },
      include: {
        images: true,
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return apiSuccess(event);
  } catch (error) {
    console.error("[gallery_post]", error);
    return apiError("Failed to create gallery event", 500);
  }
}
