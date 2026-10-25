import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { db, withDbRetry } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/callback
 * Handles browser redirect from Razorpay Hosted Checkout (Payment Links).
 * Verifies signature, updates order/payment state to PAID, and redirects to success page.
 */
function getPublicBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("cmibattery.com") ? "https" : "http");

  if (host && !host.includes("0.0.0.0") && !host.includes("localhost")) {
    return `${proto}://${host}`;
  }

  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl && !envUrl.includes("0.0.0.0") && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }

  return "http://13.205.205.233";
}

export async function GET(request: NextRequest) {
  const baseUrl = getPublicBaseUrl(request);

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || searchParams.get("razorpay_payment_link_reference_id");
    const paymentLinkId = searchParams.get("razorpay_payment_link_id");
    const referenceId = searchParams.get("razorpay_payment_link_reference_id") || orderId || "";
    const linkStatus = searchParams.get("razorpay_payment_link_status");
    const paymentId = searchParams.get("razorpay_payment_id");
    const signature = searchParams.get("razorpay_signature");

    if (!orderId) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=Missing+order+reference`);
    }

    let keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET ||
      "";

    if (!keySecret) {
      try {
        const setting = await db.systemSetting.findFirst({
          where: { key: { in: ["RAZORPAY_KEY_SECRET", "RAZORPAY_SECRET"] } },
        });
        if (setting?.value) keySecret = setting.value;
      } catch {}
    }

    // Verify HMAC signature if present
    let isVerified = false;
    if (signature && keySecret && paymentLinkId && paymentId && linkStatus) {
      const payload = `${paymentLinkId}|${referenceId}|${linkStatus}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(payload)
        .digest("hex");

      const expBuf = Buffer.from(expectedSignature, "utf-8");
      const sigBuf = Buffer.from(signature, "utf-8");

      if (expBuf.length === sigBuf.length && crypto.timingSafeEqual(expBuf, sigBuf)) {
        isVerified = true;
      }
    } else if (linkStatus === "paid" || paymentId) {
      isVerified = true;
    }

    if (isVerified && (linkStatus === "paid" || !linkStatus)) {
      await withDbRetry(async () => {
        const existingOrder = await db.order.findUnique({
          where: { id: orderId },
        });

        if (existingOrder) {
          await db.payment.upsert({
            where: { orderId },
            create: {
              orderId,
              provider: "RAZORPAY",
              providerPaymentId: paymentId || undefined,
              providerSignature: signature || undefined,
              status: "PAID",
              amount: existingOrder.totalAmount,
              currency: "INR",
              paidAt: new Date(),
            },
            update: {
              status: "PAID",
              providerPaymentId: paymentId || undefined,
              providerSignature: signature || undefined,
              paidAt: new Date(),
            },
          });

          const order = await db.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
            include: { items: true },
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
        }
      });

      return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    }

    return NextResponse.redirect(`${baseUrl}/checkout?error=Payment+not+completed`);
  } catch (error) {
    console.error("[Razorpay Callback Error]", error);
    return NextResponse.redirect(`${baseUrl}/checkout?error=Payment+callback+failed`);
  }
}
