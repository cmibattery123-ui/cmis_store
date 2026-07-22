import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        specs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return apiError("Product not found", 404);
    }

    // Fetch related products (same category, excluding current)
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

    return apiSuccess({ product, related });
  } catch {
    return apiError("Internal server error", 500);
  }
}
