import { paymentService } from "@/services/payments/payment-service";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { db, withDbRetry } from "@/lib/db";
import { paymentCreateSchema } from "@/lib/validations";
import { autoCancelExpiredPendingOrders, PAYMENT_TIMEOUT_MS } from "@/lib/orders/expire-pending";

export async function POST(request: Request) {
  try {
    const session = await auth(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON payload in request body", 400);
    }

    const validated = paymentCreateSchema.safeParse(body);
    if (!validated.success) {
      return apiError("Order ID is required", 400);
    }

    const { orderId } = validated.data;

    await autoCancelExpiredPendingOrders();

    const order = await withDbRetry(async () =>
      db.order.findUnique({
        where: { id: orderId },
        include: { user: true, shippingAddress: true, payment: true },
      })
    );

    if (!order) return apiError("Order not found", 404);

    if (order.paymentStatus === "PAID" || order.payment?.status === "PAID") {
      return apiError("Order has already been paid", 400);
    }

    // Authorization: If user is logged in, verify order ownership. If guest checkout, allow paying for pending order.
    if (session?.user?.id) {
      const isAuthorized =
        order.userId === session.user.id ||
        (session.user.email && order.user?.email?.toLowerCase() === session.user.email.toLowerCase()) ||
        session.user.role === "ADMIN";

      if (!isAuthorized) {
        return apiError("Unauthorized for this order", 403);
      }
    }

    // Check Gateway Enablement
    const gatewaySetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_ENABLED" },
    });

    if (gatewaySetting && gatewaySetting.value === "false") {
      return apiError(
        "Online payment gateway is currently paused. Please complete your order via WhatsApp.",
        403
      );
    }

    // Check if order has timed out (15 minutes)
    const isExpired = Date.now() - new Date(order.createdAt).getTime() > PAYMENT_TIMEOUT_MS;
    if (isExpired && (order.status === "PENDING" || order.paymentStatus === "PENDING")) {
      await db.$transaction([
        db.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        }),
        db.payment.upsert({
          where: { orderId },
          create: {
            orderId,
            status: "FAILED",
            amount: order.totalAmount,
            currency: "INR",
            failureReason: "Payment timed out after 15 minutes",
          },
          update: {
            status: "FAILED",
            failureReason: "Payment timed out after 15 minutes",
          },
        }),
      ]);
      return apiError("Payment time limit (15 minutes) exceeded. Order has been cancelled.", 400);
    }

    const result = await withDbRetry(async () => paymentService.createPayment(orderId));

    let keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "";

    if (!keyId) {
      try {
        const keySetting = await db.systemSetting.findUnique({
          where: { key: "RAZORPAY_KEY_ID" },
        });
        if (keySetting?.value) keyId = keySetting.value;
      } catch {}
    }

    return apiSuccess({
      ...result,
      keyId,
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress?.name || order.user?.name || session?.user?.name || "Customer",
      customerEmail: order.user?.email || session?.user?.email || "",
      customerPhone: order.shippingAddress?.phone || "",
      paymentUrl: result.paymentUrl,
    });
  } catch (error: unknown) {
    console.error("[API Payments Create POST Error]", error);
    return apiError("Payment creation failed", 500);
  }
}
