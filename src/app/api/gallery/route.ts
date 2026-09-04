import { db } from "@/lib/db";
import { apiSuccess } from "@/lib/utils/api";
import { withEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await db.galleryEvent.findMany({
      where: { isPublished: true },
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [
        { eventDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    const cacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    return apiSuccess(events || [], 200, cacheHeaders);
  } catch (error) {
    console.error("[API Gallery GET Error]", error);
    return apiSuccess([], 200);
  }
}
