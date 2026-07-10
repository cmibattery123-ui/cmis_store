import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { productFilterSchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = productFilterSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return apiError("Invalid query parameters", 400);
    }

    const { search, categoryId, isActive, isFeatured, page, limit, sortBy, sortOrder } =
      parsed.data;

    const where = {
      ...(isActive !== undefined ? { isActive } : { isActive: true }),
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

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}
