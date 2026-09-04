import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, slugify } from "@/lib/utils/api";
import { productSchema } from "@/lib/validations/product";
import { invalidateEdgeCache } from "@/lib/edge-cache";

// GET single product
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(req);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
        inventory: true,
        category: true,
      },
    });

    if (!product) return apiError("Product not found", 404);
    return apiSuccess(product);
  } catch {
    return apiError("Internal server error", 500);
  }
}

// PATCH update product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const body = await request.json();
    const validated = productSchema.partial().safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { stock, images, specs, categoryId, ...productData } = validated.data;
    if (productData.name && !productData.slug) {
      productData.slug = slugify(productData.name);
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...productData,
        ...(categoryId && { categoryId }),
      },
    });

    if (stock !== undefined) {
      await db.inventory.upsert({
        where: { productId: id },
        create: { productId: id, quantity: Number(stock), lowStockThreshold: 10 },
        update: { quantity: Number(stock) },
      });
    }

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("products", "product:");

    return apiSuccess(product);
  } catch {
    return apiError("Internal server error", 500);
  }
}

// DELETE product
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth(req);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return apiError("Product not found", 404);

    await db.product.delete({ where: { id } });

    // Invalidate edge cache so next reads fetch fresh data from Supabase
    invalidateEdgeCache("products", "product:");

    return apiSuccess(null);
  } catch {
    return apiError("Internal server error", 500);
  }
}
