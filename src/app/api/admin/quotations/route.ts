import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { quotationApprovalSchema } from "@/lib/validations/order";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status");

    const where = status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" } : {};

    const [quotations, total] = await Promise.all([
      db.quotation.findMany({
        where,
        include: {
          dealer: {
            include: { user: { select: { name: true, email: true } } },
          },
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quotation.count({ where }),
    ]);

    return apiSuccess({
      quotations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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
    if (!id) return apiError("Quotation ID is required", 400);

    const validated = quotationApprovalSchema.safeParse(rest);
    if (!validated.success) return apiError(validated.error.issues[0].message, 400);

    const { status, adminNotes, validUntil, items } = validated.data;

    const quotation = await db.$transaction(async (tx: DbTransaction) => {
      // Update line item prices if admin modified them
      if (items && items.length > 0) {
        for (const item of items) {
          const taxAmount = (item.unitPrice * item.taxRate) / 100;
          await tx.quotationItem.update({
            where: { id: item.id },
            data: {
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              taxAmount,
              totalPrice: item.unitPrice + taxAmount,
            },
          });
        }
      }

      // Recalculate totals
      const allItems = await tx.quotationItem.findMany({ where: { quotationId: id } });
      const subtotal = allItems.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
      const taxAmount = allItems.reduce((s, i) => s + Number(i.taxAmount) * i.quantity, 0);

      return tx.quotation.update({
        where: { id },
        data: {
          status,
          adminNotes,
          subtotal,
          taxAmount,
          totalAmount: subtotal + taxAmount,
          approvedById: session.user.id,
          ...(validUntil && { validUntil: new Date(validUntil) }),
        },
      });
    });

    return apiSuccess(quotation);
  } catch {
    return apiError("Internal server error", 500);
  }
}
