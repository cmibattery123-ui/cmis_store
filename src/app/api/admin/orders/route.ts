import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { updateOrderStatusSchema } from "@/lib/validations";
import { autoCancelExpiredPendingOrders } from "@/lib/orders/expire-pending";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    await autoCancelExpiredPendingOrders();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const status = searchParams.get("status");

    const where = status ? { status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "FAILED" | "REFUNDED" } : {};

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          payment: { select: { id: true, status: true, provider: true, amount: true, providerPaymentId: true, paidAt: true } },
          items: { select: { id: true, productName: true, sku: true, quantity: true, unitPrice: true, totalPrice: true } },
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const sanitizedOrders = orders.map((order) => {
      return {
        ...order,
        paymentStatus: order.payment?.status || order.paymentStatus || "PENDING",
      };
    });

    return apiSuccess({
      orders: sanitizedOrders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth(request);
    if (!session || session.user.role !== "ADMIN") return apiError("Unauthorized", 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validated = updateOrderStatusSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Invalid order status update payload", 400);
    }

    const { id, status, paymentStatus } = validated.data;
    if (!status && !paymentStatus) {
      return apiError("Either status or paymentStatus is required", 400);
    }

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { payment: true },
    });
    if (!existingOrder) {
      return apiError("Order not found", 404);
    }

    const updateData: { status?: string; paymentStatus?: string } = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (paymentStatus) {
      await db.payment.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          provider: existingOrder.payment?.provider || "ADMIN_MANUAL",
          status: paymentStatus,
          amount: existingOrder.totalAmount,
          currency: "INR",
          paidAt: paymentStatus === "PAID" ? new Date() : null,
        },
        update: {
          status: paymentStatus,
          ...(paymentStatus === "PAID" ? { paidAt: existingOrder.payment?.paidAt || new Date() } : {}),
        },
      });
    }

    return apiSuccess(order);
  } catch (error) {
    console.error("[API Admin Orders PATCH Error]", error);
    return apiError("Internal server error", 500);
  }
}
