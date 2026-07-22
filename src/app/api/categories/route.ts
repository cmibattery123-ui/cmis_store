import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(categories);
  } catch {
    return apiError("Internal server error", 500);
  }
}
