import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";
import { withEdgeCache } from "@/lib/edge-cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const cacheKey = `product:${slug}`;

    const cachedData = await withEdgeCache(cacheKey, 60, ["products", `product:${slug}`], async () => {
      try {
        const product = await db.product.findUnique({
          where: { slug, isActive: true },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            category: { select: { id: true, name: true, slug: true } },
            inventory: true,
            specs: { orderBy: { sortOrder: "asc" } },
          },
        });

        if (product) {
          const related = await db.product.findMany({
            where: {
              categoryId: product.categoryId,
              isActive: true,
              id: { not: product.id },
            },
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              inventory: { select: { quantity: true } },
            },
            take: 4,
          });

          return { product, related };
        }
      } catch {
        // Fallback below
      }

      const fallbackProduct = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
      if (fallbackProduct) {
        const related = DEFAULT_PRODUCTS.filter((p) => p.id !== fallbackProduct.id).slice(0, 4);
        return { product: fallbackProduct, related };
      }

      return null;
    });

    if (cachedData) {
      return apiSuccess(cachedData, 200, {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Edge-Cache": "HIT",
      });
    }

    return apiError("Product not found", 404);
  } catch {
    return apiError("Internal server error", 500);
  }
}
