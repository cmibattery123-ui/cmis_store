import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return apiError("Items must be an array", 400);
    }

    // Use transaction for bulk update
    await db.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        db.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("[products_reorder]", error);
    return apiError("Failed to reorder products", 500);
  }
}
