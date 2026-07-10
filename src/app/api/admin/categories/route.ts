import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, slugify } from "@/lib/utils/api";
import { categorySchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(categories);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const body = await request.json();
    const validated = categorySchema.safeParse(body);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const data = validated.data;
    const slug = data.slug || slugify(data.name);

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) return apiError("A category with this slug already exists", 409);

    const category = await db.category.create({
      data: { ...data, slug },
    });

    return apiSuccess(category, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return apiError("Category ID required", 400);

    const validated = categorySchema.partial().safeParse(rest);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const category = await db.category.update({ where: { id }, data: validated.data });
    return apiSuccess(category);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("Category ID required", 400);

    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return apiError(`Cannot delete — ${productCount} products are in this category`, 409);
    }

    await db.category.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Internal server error", 500);
  }
}
