import { db } from "@/lib/db";
import { apiSuccess } from "@/lib/utils/api";
import { DEFAULT_CATEGORIES } from "@/lib/default-data";
import { withEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cachedCategories = await withEdgeCache("categories:all", 120, ["categories"], async () => {
      const categories = await db.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
        orderBy: { sortOrder: "asc" },
      });

      if (categories && categories.length > 0) {
        return categories;
      }
      return null;
    });

    const cacheHeaders = {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      "X-Edge-Cache": "HIT",
    };

    if (cachedCategories && cachedCategories.length > 0) {
      return apiSuccess(cachedCategories, 200, cacheHeaders);
    }
  } catch (error) {
    console.warn("[API Categories GET Fallback to default]", error);
  }

  return apiSuccess(DEFAULT_CATEGORIES, 200, {
    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
  });
}
