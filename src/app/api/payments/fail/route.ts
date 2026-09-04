import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { auth } from "@/lib/auth";
import { paymentFailSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validated = paymentFailSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Missing orderId", 400);
    }

    const { orderId, reason } = validated.data;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return apiError("Order not found", 404);
    }

    // If order is already paid, do not mark as failed
    if (order.paymentStatus === "PAID" || order.payment?.status === "PAID") {
      return apiSuccess({ message: "Order is already paid", order });
    }

    // Verify session user ownership if session exists
    if (session?.user?.id && order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return apiError("Unauthorized", 403);
    }

    const failureReason = reason || "Payment cancelled or failed at gateway";

    // Mark order as CANCELLED and payment as FAILED
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
      },
    });

    await db.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider: "RAZORPAY",
        status: "FAILED",
        amount: order.totalAmount,
        currency: "INR",
        failureReason,
      },
      update: {
        status: "FAILED",
        failureReason,
      },
    });

    return apiSuccess({
      message: "Order marked as CANCELLED",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[API Payments Fail POST]", error);
    return apiError("Failed to update order status", 500);
  }
}
