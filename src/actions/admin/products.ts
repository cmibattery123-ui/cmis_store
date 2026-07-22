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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized", {});

  const validated = productSchema.safeParse(formData);
  if (!validated.success) {
    return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { specs, ...data } = validated.data;
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
      specs: specs ? {
        create: specs.map((s, i) => ({ ...s, sortOrder: i })),
      } : undefined,
      inventory: {
        create: { quantity: 0, lowStockThreshold: 10 },
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return actionSuccess(undefined, "Product created successfully");
}

// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(id: string, formData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

  const validated = productSchema.safeParse(formData);
  if (!validated.success) {
    return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { specs, ...data } = validated.data;

  await db.product.update({
    where: { id },
    data: {
      ...data,
      specs: specs ? {
        deleteMany: {},
        create: specs.map((s, i) => ({ ...s, sortOrder: i })),
      } : undefined,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return actionSuccess(undefined, "Product updated successfully");
}

// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

  await db.product.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/admin/products");
  return actionSuccess(undefined, "Product deactivated");
}

// ============================================================
// UPDATE INVENTORY
// ============================================================

export async function updateInventory(productId: string, quantity: number): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

  await db.inventory.upsert({
    where: { productId },
    update: { quantity },
    create: { productId, quantity },
  });

  revalidatePath("/admin/inventory");
  return actionSuccess(undefined, "Inventory updated");
}
