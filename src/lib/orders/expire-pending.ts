import { db } from "@/lib/db";

export const PAYMENT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Automatically cancels orders and sets payment status to FAILED
 * if an order has been pending for more than 15 minutes without payment.
 */
export async function autoCancelExpiredPendingOrders(userId?: string) {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - PAYMENT_TIMEOUT_MS);

    const whereCondition: any = {
      createdAt: { lt: fifteenMinutesAgo },
      OR: [
        { status: "PENDING" },
        { paymentStatus: "PENDING" },
      ],
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    const expiredOrders = await db.order.findMany({
      where: whereCondition,
      select: { id: true },
    });

    if (expiredOrders.length === 0) return 0;

    const expiredOrderIds = expiredOrders.map((o) => o.id);

    await db.$transaction([
      db.order.updateMany({
        where: { id: { in: expiredOrderIds } },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      }),
      db.payment.updateMany({
        where: { orderId: { in: expiredOrderIds } },
        data: {
          status: "FAILED",
          failureReason: "Payment timed out after 15 minutes",
        },
      }),
    ]);

    return expiredOrderIds.length;
  } catch (error) {
    console.error("[autoCancelExpiredPendingOrders Error]", error);
    return 0;
  }
}
