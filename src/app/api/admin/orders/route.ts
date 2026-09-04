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
          payment: { select: { status: true, provider: true, amount: true } },
          items: { select: { productName: true, quantity: true, totalPrice: true } },
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const sanitizedOrders = orders.map((order) => {
      const isFailed = order.payment?.status === "FAILED" || order.paymentStatus === "FAILED";
      return {
        ...order,
        status: isFailed ? "FAILED" : order.status,
        paymentStatus: isFailed ? "FAILED" : order.paymentStatus,
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

    const { id, status } = validated.data;

    const existingOrder = await db.order.findUnique({
      where: { id },
    });
    if (!existingOrder) {
      return apiError("Order not found", 404);
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
    });

    return apiSuccess(order);
  } catch (error) {
    console.error("[API Admin Orders PATCH Error]", error);
    return apiError("Internal server error", 500);
  }
}
