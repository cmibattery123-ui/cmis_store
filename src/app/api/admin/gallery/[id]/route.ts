import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

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

    if (!event) return apiError("Event not found", 404);
    return apiSuccess(event);
  } catch (error) {
    console.error("[gallery_id_get]", error);
    return apiError("Failed to fetch gallery event", 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { id } = await params;
    const body = await request.json();
    
    // Check if it's a reorder request
    if (body.action === 'reorder' && Array.isArray(body.items)) {
      await db.$transaction(
        body.items.map((item: { id: string; sortOrder: number }) =>
          db.galleryEvent.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );
      return apiSuccess({ success: true });
    }

    const { name, category, eventDate, location, description, isFeatured, isPublished, media, images } = body;
    const mediaToCreate = media || images;

    const event = await db.galleryEvent.update({
      where: { id },
      data: {
        name,
        category,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        location,
        description,
        isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
        isPublished: isPublished !== undefined ? !!isPublished : undefined,
        media: mediaToCreate ? {
          deleteMany: {},
          create: mediaToCreate.map((img: any, i: number) => ({
            mediaType: img.mediaType || "IMAGE",
            url: img.url,
            publicId: img.publicId,
            thumbnailUrl: img.thumbnailUrl,
            isCover: !!img.isCover,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        media: { orderBy: { sortOrder: "asc" } },
      },
    });

    return apiSuccess(event);
  } catch (error) {
    console.error("[gallery_id_put]", error);
    return apiError("Failed to update gallery event", 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { id } = await params;
    
    await db.galleryEvent.delete({
      where: { id },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("[gallery_id_delete]", error);
    return apiError("Failed to delete gallery event", 500);
  }
}
