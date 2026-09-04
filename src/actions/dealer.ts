"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  dealerRegistrationSchema,
  quotationRequestSchema,
  quotationApprovalSchema,
} from "@/lib/validations";
import {
  actionSuccess,
  actionError,
  generateQuotationNumber,
  type ActionResult,
} from "@/lib/utils/api";
import { revalidatePath } from "next/cache";

// ============================================================
// DEALER REGISTRATION
// ============================================================

export async function registerDealer(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user) return actionError("Please log in first");

    const validated = dealerRegistrationSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const existingDealer = await db.dealer.findUnique({
      where: { userId: session.user.id },
    });
    if (existingDealer) return actionError("You already have a dealer application");

    await db.dealer.create({
      data: {
        userId: session.user.id,
        ...validated.data,
        status: "PENDING",
      },
    });

    revalidatePath("/dealer");
    return actionSuccess(undefined, "Dealer application submitted successfully. You will be notified upon approval.");
  } catch (error) {
    console.error("[registerDealer]", error);
    return actionError("Failed to submit dealer application. Please try again.");
  }
}

// ============================================================
// APPROVE / REJECT DEALER (Admin only)
// ============================================================

export async function updateDealerStatus(
  dealerId: string,
  status: "APPROVED" | "REJECTED" | "SUSPENDED"
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    if (!dealerId || typeof dealerId !== "string") {
      return actionError("Dealer ID is required");
    }

    const dealer = await db.dealer.update({
      where: { id: dealerId },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
        approvedById: status === "APPROVED" ? session.user.id : null,
      },
      include: { user: true },
    });

    // Update user role when approved
    if (status === "APPROVED") {
      await db.user.update({
        where: { id: dealer.userId },
        data: { role: "DEALER" },
      });

      // Notify dealer
      await db.notification.create({
        data: {
          userId: dealer.userId,
          type: "DEALER",
          title: "Dealer Application Approved",
          message: "Congratulations! Your dealer application has been approved. You can now access dealer pricing and place bulk orders.",
          link: "/dealer/dashboard",
        },
      });
    }

    revalidatePath("/admin/dealers");
    return actionSuccess(undefined, `Dealer ${status.toLowerCase()} successfully`);
  } catch (error) {
    console.error("[updateDealerStatus]", error);
    return actionError("Failed to update dealer status. Please try again.");
  }
}

// ============================================================
// REQUEST QUOTATION (Dealer)
// ============================================================

export async function requestQuotation(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "DEALER" && session.user.role !== "ADMIN")) {
      return actionError("Dealer access required");
    }

    const validated = quotationRequestSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const dealer = await db.dealer.findUnique({ where: { userId: session.user.id } });
    if (!dealer || dealer.status !== "APPROVED") {
      return actionError("Your dealer account must be approved first");
    }

    const products = await db.product.findMany({
      where: { id: { in: validated.data.items.map((i) => i.productId) } },
    });

    if (products.length === 0) {
      return actionError("Selected products are unavailable");
    }

    const items: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      taxAmount: number;
      totalPrice: number;
    }[] = [];
    for (const item of validated.data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return actionError(`Product with ID ${item.productId} was not found`);
      }
      const unitPrice = Number(product.dealerPrice || product.price);
      const taxRate = Number(product.taxRate || 18);
      const taxAmount = (unitPrice * taxRate) / 100;
      items.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        taxRate,
        taxAmount: taxAmount * item.quantity,
        totalPrice: (unitPrice + taxAmount) * item.quantity,
      });
    }

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0);

    const quotationCount = await db.quotation.count();

    await db.quotation.create({
      data: {
        quotationNo: generateQuotationNumber(quotationCount + 1),
        dealerId: dealer.id,
        notes: validated.data.notes,
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        status: "PENDING",
        items: { create: items },
      },
    });

    revalidatePath("/dealer/quotations");
    return actionSuccess(undefined, "Quotation request submitted");
  } catch (error) {
    console.error("[requestQuotation]", error);
    return actionError("Failed to submit quotation request. Please try again.");
  }
}

// ============================================================
// APPROVE / REJECT QUOTATION (Admin only)
// ============================================================

export async function processQuotation(formData: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return actionError("Unauthorized");

    const validated = quotationApprovalSchema.safeParse(formData);
    if (!validated.success) {
      return actionError("Validation failed", validated.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { quotationId, status, adminNotes, validDays } = validated.data;

    const validUntil = status === "APPROVED"
      ? new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
      : null;

    await db.quotation.update({
      where: { id: quotationId },
      data: {
        status,
        adminNotes,
        validUntil,
        approvedById: session.user.id,
      },
    });

    revalidatePath("/admin/quotations");
    return actionSuccess(undefined, `Quotation ${status.toLowerCase()} successfully`);
  } catch (error) {
    console.error("[processQuotation]", error);
    return actionError("Failed to process quotation. Please try again.");
  }
}
