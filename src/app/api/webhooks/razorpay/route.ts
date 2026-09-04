import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/utils/api";

/**
 * POST /api/webhooks/razorpay
 * Asynchronous Webhook Handler for Razorpay Background Events
 * Captures `payment.captured` and `payment.failed` in case of client disconnects/network drops.
 * Validates `x-razorpay-signature` header against RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return apiError("Missing x-razorpay-signature header", 400);
    }

    const rawBody = await request.text();

    // 1. Fetch Webhook Secret from DB or Environment
    const webhookSecretSetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_WEBHOOK_SECRET" },
    });
    const keySecretSetting = await db.systemSetting.findUnique({
      where: { key: "RAZORPAY_KEY_SECRET" },
    });

    const webhookSecret =
      webhookSecretSetting?.value ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      keySecretSetting?.value ||
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      "";

    // 2. Validate HMAC Signature
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(signature, "utf-8")
      );

      if (!isSignatureValid) {
        console.warn("[Webhook Security Alert] Invalid Razorpay webhook signature");
        return apiError("Invalid webhook signature", 400);
      }
    } else {
      console.warn(
        "[Webhook Warning] RAZORPAY_WEBHOOK_SECRET not configured. Processing in unverified mode."
      );
    }

    // 3. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity) {
      return apiSuccess({ received: true, note: "No payment entity payload" });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (!razorpayOrderId) {
      return apiSuccess({ received: true, note: "Missing order_id" });
    }

    // 4. Locate Payment Record in Prisma DB
    const existingPayment = await db.payment.findFirst({
      where: { providerOrderId: razorpayOrderId },
      include: { order: true },
    });

    if (!existingPayment) {
      console.warn(`[Webhook Warning] No payment record found for Razorpay order: ${razorpayOrderId}`);
      return apiSuccess({ received: true, note: "Payment record not found" });
    }

    // 5. Handle Specific Gateway Events
    switch (eventType) {
      case "payment.captured": {
        // Idempotency: Skip if already marked PAID
        if (existingPayment.status !== "PAID") {
          await db.$transaction([
            db.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: "PAID",
                providerPaymentId: razorpayPaymentId,
                paidAt: new Date(),
              },
            }),
            db.order.update({
              where: { id: existingPayment.orderId },
              data: {
                paymentStatus: "PAID",
                status: "CONFIRMED",
              },
            }),
          ]);
          console.log(`[Webhook Success] Order ${existingPayment.orderId} marked PAID via payment.captured webhook`);
        }
        break;
      }

      case "payment.failed": {
        const failureReason =
          paymentEntity.error_description || paymentEntity.error_reason || "Payment failed at gateway";

        if (existingPayment.status !== "PAID") {
          await db.$transaction([
            db.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: "FAILED",
                failureReason,
              },
            }),
            db.order.update({
              where: { id: existingPayment.orderId },
              data: {
                status: "FAILED",
                paymentStatus: "FAILED",
              },
            }),
          ]);
          console.log(`[Webhook Failure] Order ${existingPayment.orderId} marked FAILED via payment.failed webhook`);
        }
        break;
      }

      default:
        console.log(`[Webhook Info] Received unhandled event type: ${eventType}`);
        break;
    }

    return apiSuccess({ received: true, event: eventType });
  } catch (error) {
    console.error("[API Webhooks Razorpay POST]", error);
    return apiError("Webhook handling failed", 500);
  }
}
