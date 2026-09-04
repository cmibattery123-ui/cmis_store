"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { slugify, actionSuccess, actionError, type ActionResult } from "@/lib/utils/api";
import { revalidatePath } from "next/cache";

// ============================================================
// CREATE PRODUCT
// ============================================================

export async function createProduct(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    const validated = productSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { specs, images, stock, ...data } = validated.data;
    const slug = slugify(data.name);

    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) return actionError("A product with this name already exists");

    await db.product.create({
      data: {
        ...data,
        slug,
        price: data.price,
        dealerPrice: data.dealerPrice,
        taxRate: data.taxRate,
        images: images && images.length > 0 ? {
          create: images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId || img.url,
            isPrimary: img.isPrimary ?? false,
            sortOrder: img.sortOrder ?? i,
            altText: img.altText ?? null,
          })),
        } : undefined,
        specs: specs && specs.length > 0 ? {
          create: specs.map((s, i) => ({ ...s, sortOrder: s.sortOrder ?? i })),
        } : undefined,
        inventory: {
          create: { quantity: stock ?? 0, lowStockThreshold: 10 },
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return actionSuccess(undefined, "Product created successfully");
  } catch (error) {
    console.error("[createProduct]", error);
    return actionError("Failed to create product. Please try again.");
  }
}

// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(id: string, formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    if (!id || typeof id !== "string") {
      return actionError("Product ID is required");
    }

    const validated = productSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { specs, images, stock, ...data } = validated.data;

    await db.product.update({
      where: { id },
      data: {
        ...data,
        images: images ? {
          deleteMany: {},
          create: images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId || img.url,
            isPrimary: img.isPrimary ?? false,
            sortOrder: img.sortOrder ?? i,
            altText: img.altText ?? null,
          })),
        } : undefined,
        specs: specs ? {
          deleteMany: {},
          create: specs.map((s, i) => ({ ...s, sortOrder: s.sortOrder ?? i })),
        } : undefined,
      },
    });

    if (typeof stock === "number") {
      await db.inventory.upsert({
        where: { productId: id },
        update: { quantity: stock },
        create: { productId: id, quantity: stock },
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return actionSuccess(undefined, "Product updated successfully");
  } catch (error) {
    console.error("[updateProduct]", error);
    return actionError("Failed to update product. Please try again.");
  }
}

// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    if (!id || typeof id !== "string") {
      return actionError("Product ID is required");
    }

    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/admin/products");
    return actionSuccess(undefined, "Product deactivated");
  } catch (error) {
    console.error("[deleteProduct]", error);
    return actionError("Failed to delete product. Please try again.");
  }
}

// ============================================================
// UPDATE INVENTORY
// ============================================================

export async function updateInventory(productId: string, quantity: number): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    if (!productId || typeof productId !== "string" || typeof quantity !== "number" || isNaN(quantity)) {
      return actionError("Invalid inventory data");
    }

    await db.inventory.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, quantity },
    });

    revalidatePath("/admin/inventory");
    return actionSuccess(undefined, "Inventory updated");
  } catch (error) {
    console.error("[updateInventory]", error);
    return actionError("Failed to update inventory. Please try again.");
  }
}
