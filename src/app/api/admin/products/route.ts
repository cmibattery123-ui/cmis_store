import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, slugify } from "@/lib/utils/api";
import { productSchema } from "@/lib/validations/product";
import { z } from "zod";

// GET all products (admin — includes inactive)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const search = searchParams.get("search") ?? "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          inventory: { select: { quantity: true, lowStockThreshold: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return apiSuccess({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

// POST create product (admin)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const body = await request.json();
    const validated = productSchema.safeParse(body);
    if (!validated.success) {
      return apiError(validated.error.issues[0].message, 400);
    }

    const data = validated.data;
    const slug = data.slug || slugify(data.name);

    // Check uniqueness
    const [existingSlug, existingSku] = await Promise.all([
      db.product.findUnique({ where: { slug } }),
      db.product.findUnique({ where: { sku: data.sku } }),
    ]);

    if (existingSlug) return apiError("A product with this slug already exists", 409);
    if (existingSku) return apiError("A product with this SKU already exists", 409);

    const product = await db.$transaction(async (tx: DbTransaction) => {
      const p = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          shortDesc: data.shortDesc,
          sku: data.sku,
          price: data.price,
          dealerPrice: data.dealerPrice,
          taxRate: data.taxRate,
          categoryId: data.categoryId,
          warrantyMonths: data.warrantyMonths,
          weight: data.weight,
          datasheetUrl: data.datasheetUrl || null,
          metaTitle: data.metaTitle,
          metaDesc: data.metaDesc,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          images: {
            create: data.images?.map(img => ({
              url: img.url,
              publicId: img.publicId ?? "cmi-batteries/products/default",
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
              altText: img.altText,
            })) || [],
          },
          specs: {
            create: data.specs?.map(spec => ({
              label: spec.label,
              value: spec.value,
              unit: spec.unit,
              sortOrder: spec.sortOrder,
            })) || [],
          },
        },
      });

      // Create inventory record
      await tx.inventory.create({
        data: { productId: p.id },
      });

      return p;
    });

    return apiSuccess(product, 201);
  } catch {
    return apiError("Internal server error", 500);
  }
}
