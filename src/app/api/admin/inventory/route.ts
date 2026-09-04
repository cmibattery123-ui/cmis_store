import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { invalidateEdgeCache } from "@/lib/edge-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock") === "true";

    const inventory = await db.inventory.findMany({
      where: lowStock
        ? { quantity: { lte: 10 } }
        : undefined,
      include: {
        product: {
          select: { id: true, name: true, sku: true, isActive: true, category: { select: { name: true } } },
        },
      },
      orderBy: { quantity: "asc" },
    });

    return apiSuccess(inventory);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { productId, quantity, lowStockThreshold } = await request.json();
    if (!productId) return apiError("Product ID is required", 400);

    const inventory = await db.inventory.upsert({
      where: { productId },
      create: {
        productId,
        quantity: quantity ?? 0,
        lowStockThreshold: lowStockThreshold ?? 10,
      },
      update: {
        ...(quantity !== undefined && { quantity }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold }),
      },
    });

    // Invalidate edge cache so next reads fetch fresh inventory/stock data from Supabase
    invalidateEdgeCache("products", "product:", "dealer-products");

    return apiSuccess(inventory);
  } catch {
    return apiError("Internal server error", 500);
  }
}
