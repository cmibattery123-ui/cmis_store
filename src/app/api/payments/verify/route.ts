import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { auth } from "@/lib/auth";
import { db, withDbRetry } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";
import { z } from "zod";
import { autoCancelExpiredPendingOrders, PAYMENT_TIMEOUT_MS } from "@/lib/orders/expire-pending";

const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpay_order_id: z.string().optional(),
  providerOrderId: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  providerPaymentId: z.string().optional(),
  razorpay_signature: z.string().optional(),
  signature: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Session Authentication
    const session = await auth(request);
    if (!session?.user) {
      return apiError("Unauthorized. Authentication required to verify payment.", 401);
    }

    // 2. Validate Payload Schema
    const body = await request.json();
    const validated = verifyPaymentSchema.safeParse(body);

    if (!validated.success) {
      return apiError("Invalid payment verification payload.", 400);
    }

    const {
      orderId,
      razorpay_order_id,
      providerOrderId,
      razorpay_payment_id,
      providerPaymentId,
      razorpay_signature,
      signature,
    } = validated.data;

    const rzpOrderId = razorpay_order_id || providerOrderId || "";
    const rzpPaymentId = razorpay_payment_id || providerPaymentId || "";
    const rzpSignature = razorpay_signature || signature || "";

    if (!rzpOrderId || !rzpPaymentId) {
      return apiError("Missing payment identifier details.", 400);
    }

    await autoCancelExpiredPendingOrders();

    return await withDbRetry(async () => {
      // 3. Fetch Order & Payment from DB
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { payment: true, user: true, items: true },
      });

      if (!order) {
        return apiError("Order record not found.", 404);
      }

      const isAuthorized =
        order.userId === session.user.id ||
        (session.user.email && order.user?.email?.toLowerCase() === session.user.email.toLowerCase()) ||
        session.user.role === "ADMIN";

      if (!isAuthorized) {
        return apiError("Unauthorized for this order", 403);
      }

      // 4. Idempotency Check — Prevent duplicate payment processing
      if (order.paymentStatus === "PAID" && order.payment?.status === "PAID") {
        return apiSuccess({
          verified: true,
          idempotent: true,
          message: "Order has already been verified and marked as PAID.",
          paymentId: order.payment?.providerPaymentId || rzpPaymentId,
        });
      }

      // Check if order payment window (15 minutes) has expired
      const isExpired = Date.now() - new Date(order.createdAt).getTime() > PAYMENT_TIMEOUT_MS;
      if (isExpired) {
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
        return apiError("Payment window (15 minutes) expired. Order has been cancelled.", 400);
      }

      const keySecret =
        process.env.RAZORPAY_KEY_SECRET ||
        process.env.RAZORPAY_SECRET ||
        "";

      const isMock = rzpPaymentId.startsWith("mock_") || !rzpSignature;

      // 5. HMAC-SHA256 Signature Verification for real Razorpay responses
      if (!isMock && keySecret && rzpSignature) {
        const payload = `${rzpOrderId}|${rzpPaymentId}`;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(payload)
          .digest("hex");

        const isSignatureValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, "utf-8"),
          Buffer.from(rzpSignature, "utf-8")
        );

        if (!isSignatureValid) {
          console.warn(`[Payment Security Alert] Invalid HMAC signature for Order ${orderId}`);
          
          await db.$transaction([
            db.payment.update({
              where: { orderId },
              data: {
                status: "FAILED",
                failureReason: "HMAC-SHA256 signature mismatch",
              },
            }),
            db.order.update({
              where: { id: orderId },
              data: {
                status: "FAILED",
                paymentStatus: "FAILED",
              },
            }),
          ]);

          return apiError("Payment signature verification failed. Untrusted response.", 400);
        }
      }

      // 6. Update database records
      await db.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          provider: !isMock && keySecret ? "RAZORPAY" : "MOCK",
          providerOrderId: rzpOrderId,
          providerPaymentId: rzpPaymentId,
          providerSignature: rzpSignature || null,
          status: "PAID",
          amount: order.totalAmount,
          currency: "INR",
          paidAt: new Date(),
        },
        update: {
          status: "PAID",
          providerPaymentId: rzpPaymentId,
          providerSignature: rzpSignature || null,
          paidAt: new Date(),
        },
      });

      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      for (const item of order.items) {
        try {
          await db.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              quantity: { decrement: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            },
          });
        } catch {}
      }

      // Clear user DB cart upon successful payment
      if (order.userId) {
        try {
          const userCart = await db.cart.findUnique({ where: { userId: order.userId } });
          if (userCart) {
            await db.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        } catch (e) {
          console.warn("[Payment Verify] Failed to clear DB cart", e);
        }
      }

      return apiSuccess({
        verified: true,
        idempotent: false,
        message: "Payment verified successfully.",
        paymentId: rzpPaymentId,
      });
    });
  } catch (error) {
    console.error("[API Payments Verify POST]", error);
    return apiError("Payment verification failed", 500);
  }
}
