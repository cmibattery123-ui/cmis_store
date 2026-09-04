import { db } from "@/lib/db";
import { auth, getDbUserFromSession } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { withEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    const dbUser = await getDbUserFromSession(session);
    if (!dbUser) return apiError("Unauthorized", 401);

    const dealer = await db.dealer.findUnique({ where: { userId: dbUser.id } });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));

    const discountPercent = dealer ? Number(dealer.discountPercent) : 0;
    const cacheKey = `dealer-products:${search}:${page}:${limit}`;

    const cachedProducts = await withEdgeCache(cacheKey, 60, ["products", "dealer-products"], async () => {
      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ];
      }

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true } },
            inventory: { select: { quantity: true, lowStockThreshold: true } },
            specs: { orderBy: { sortOrder: "asc" }, take: 3 },
          },
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    });

    return apiSuccess({
      ...cachedProducts,
      discountPercent,
    }, 200, {
      "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
      "X-Edge-Cache": "HIT",
    });
  } catch (error) {
    console.error("[dealer_products_get]", error);
    return apiError("Internal server error", 500);
  }
}
