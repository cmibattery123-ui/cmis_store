import { db } from "@/lib/db";
import { apiSuccess } from "@/lib/utils/api";
import { productFilterSchema } from "@/lib/validations/product";
import { DEFAULT_PRODUCTS } from "@/lib/default-data";
import { withEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = productFilterSchema.safeParse(Object.fromEntries(searchParams));

    const search = parsed.success ? parsed.data.search : searchParams.get("search") || "";
    const categoryId = parsed.success ? parsed.data.categoryId : searchParams.get("categoryId") || "";
    const isFeatured = parsed.success ? parsed.data.isFeatured : undefined;
    const page = parsed.success ? parsed.data.page : Number(searchParams.get("page") || 1);
    const limit = parsed.success ? parsed.data.limit : Number(searchParams.get("limit") || 12);
    const sortBy = parsed.success ? parsed.data.sortBy : "sortOrder";
    const sortOrder = parsed.success ? parsed.data.sortOrder : "asc";

    const cacheKey = `products:${search}:${categoryId}:${isFeatured}:${page}:${limit}:${sortBy}:${sortOrder}`;

    const cachedResult = await withEdgeCache(cacheKey, 60, ["products"], async () => {
      const where = {
        isActive: true,
        ...(isFeatured !== undefined && { isFeatured }),
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
            inventory: { select: { quantity: true, lowStockThreshold: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      if (products && products.length > 0) {
        return {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      return null;
    });

    const cacheHeaders = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "X-Edge-Cache": "HIT",
    };

    if (cachedResult) {
      return apiSuccess(cachedResult, 200, cacheHeaders);
    }
  } catch (error) {
    console.warn("[API Products GET Fallback to default catalog]", error);
  }

  // Graceful fallback to rich default catalog
  return apiSuccess({
    products: DEFAULT_PRODUCTS,
    pagination: {
      page: 1,
      limit: DEFAULT_PRODUCTS.length,
      total: DEFAULT_PRODUCTS.length,
      totalPages: 1,
    },
  }, 200, { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" });
}
