"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { actionError, actionSuccess, slugify, type ActionResult } from "@/lib/utils/api";
import { productSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

type ProductDecision = "APPROVED" | "REJECTED";

function revalidateProductViews() {
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/dealer/products");
}

function readValue(input: FormData | Record<string, unknown>, key: string) {
  const value = input instanceof FormData ? input.get(key) : input[key];
  return typeof value === "string" ? value.trim() : "";
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "battery";
  let slug = base;
  let number = 2;
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${number++}`;
  }
  return slug;
}

async function uniqueSku(name: string) {
  const base = (slugify(name).replace(/-/g, "").slice(0, 10) || "BATTERY").toUpperCase();
  let sku = `${base}-${Date.now().toString().slice(-6)}`;
  let number = 2;
  while (await db.product.findUnique({ where: { sku }, select: { id: true } })) {
    sku = `${base}-${Date.now().toString().slice(-6)}-${number++}`;
  }
  return sku;
}

/** Dealer/Admin product proposal. Proposals are deliberately hidden from the public catalog until approved. */
export async function proposeProductAction(formData: FormData | Record<string, unknown>): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id || !["DEALER", "ADMIN"].includes(session.user.role)) {
    return actionError("Only dealers and administrators can submit products.");
  }

  const name = readValue(formData, "name");
  const description = readValue(formData, "description");
  const capacity = readValue(formData, "capacity");
  const warrantyMonths = Number(readValue(formData, "warrantyMonths"));
  const price = Number(readValue(formData, "price"));
  const requestedCategoryId = readValue(formData, "categoryId");

  if (name.length < 2 || description.length < 10 || !capacity || !Number.isFinite(price) || price <= 0 || !Number.isInteger(warrantyMonths) || warrantyMonths < 0) {
    return actionError("Enter a model name, capacity, description, a positive price, and a valid warranty period.");
  }

  const category = requestedCategoryId
    ? await db.category.findUnique({ where: { id: requestedCategoryId }, select: { id: true } })
    : await db.category.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true } });
  if (!category) return actionError("A product category is required before products can be submitted.");

  const [slug, sku] = await Promise.all([uniqueSlug(name), uniqueSku(name)]);
  const product = await db.product.create({
    data: {
      name,
      slug,
      sku,
      description,
      shortDesc: description.slice(0, 200),
      price,
      dealerPrice: price,
      categoryId: category.id,
      capacity,
      warrantyMonths,
      status: "PENDING",
      createdBy: session.user.role === "ADMIN" ? "ADMIN" : session.user.id,
      isActive: false,
      inventory: { create: { quantity: 0, lowStockThreshold: 10 } },
    },
  });

  revalidateProductViews();
  return actionSuccess({ id: product.id }, "Product submitted for review.");
}

export async function validateProductAction(productId: string, decision: ProductDecision): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Only administrators can validate products.");
  if (decision !== "APPROVED" && decision !== "REJECTED") return actionError("Invalid review decision.");

  await db.product.update({
    where: { id: productId },
    data: { status: decision, isActive: decision === "APPROVED" },
  });
  revalidateProductViews();
  return actionSuccess(undefined, `Product ${decision.toLowerCase()}.`);
}

export async function updateProductAction(productId: string, formData: FormData | Record<string, unknown>): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Only administrators can edit products.");

  const name = readValue(formData, "name");
  const description = readValue(formData, "description");
  const capacity = readValue(formData, "capacity");
  const price = Number(readValue(formData, "price"));
  const warrantyMonths = Number(readValue(formData, "warrantyMonths"));
  if (name.length < 2 || description.length < 10 || !capacity || !Number.isFinite(price) || price <= 0 || !Number.isInteger(warrantyMonths) || warrantyMonths < 0) {
    return actionError("Enter valid product details.");
  }

  await db.product.update({
    where: { id: productId },
    data: { name, description, shortDesc: description.slice(0, 200), capacity, price, warrantyMonths },
  });
  revalidateProductViews();
  return actionSuccess(undefined, "Product updated.");
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Only administrators can delete products.");

  await db.product.delete({ where: { id: productId } });
  revalidateProductViews();
  return actionSuccess(undefined, "Product permanently deleted.");
}

// Existing admin form integrations retain these exports while using the same authorization rules.
export async function createProduct(formData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");
  const validated = productSchema.safeParse(formData);
  if (!validated.success) return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
  const { specs, ...data } = validated.data;
  const slug = data.slug || await uniqueSlug(data.name);
  await db.product.create({
    data: { ...data, slug, status: "APPROVED", createdBy: "ADMIN", specs: specs ? { create: specs.map((spec, index) => ({ ...spec, sortOrder: index })) } : undefined, inventory: { create: { quantity: 0, lowStockThreshold: 10 } } },
  });
  revalidateProductViews();
  return actionSuccess(undefined, "Product created successfully");
}

export async function updateProduct(id: string, formData: unknown): Promise<ActionResult> {
  return updateProductAction(id, formData as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  return deleteProductAction(id);
}

export async function updateInventory(productId: string, quantity: number): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");
  await db.inventory.upsert({ where: { productId }, update: { quantity }, create: { productId, quantity } });
  revalidatePath("/admin/inventory");
  return actionSuccess(undefined, "Inventory updated");
}
