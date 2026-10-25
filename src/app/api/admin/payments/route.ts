import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const status = searchParams.get("status");

    const where: any = {};
    if (status && ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(status)) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    return apiSuccess({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[admin_payments_get]", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const { id, status } = body || {};
    if (!id || !["PENDING", "PAID", "FAILED", "REFUNDED"].includes(status)) {
      return apiError("Valid payment ID and status (PENDING, PAID, FAILED, REFUNDED) are required", 400);
    }

    const existing = await db.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existing) {
      return apiError("Payment record not found", 404);
    }

    const updatedPayment = await db.payment.update({
      where: { id },
      data: {
        status,
        ...(status === "PAID" ? { paidAt: existing.paidAt || new Date() } : {}),
      },
    });

    if (existing.orderId) {
      await db.order.update({
        where: { id: existing.orderId },
        data: {
          paymentStatus: status,
          ...(status === "PAID" && existing.order?.status === "PENDING" ? { status: "CONFIRMED" } : {}),
        },
      });
    }

    return apiSuccess(updatedPayment);
  } catch (error) {
    console.error("[admin_payments_patch]", error);
    return apiError("Internal server error", 500);
  }
}
