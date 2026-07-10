import { MockPaymentProvider } from "./mock-payment";
import { RazorpayPaymentProvider } from "./razorpay";
import type { PaymentProvider, PaymentCreateParams, PaymentVerifyParams, PaymentRefundParams } from "./types";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Provider factory — swap provider by env var without changing business logic
// ─────────────────────────────────────────────────────────────────────────────
function getProvider(): PaymentProvider {
  const useRazorpay =
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_SECRET &&
    process.env.NODE_ENV === "production";

  return useRazorpay ? new RazorpayPaymentProvider() : new MockPaymentProvider();
}

// ─────────────────────────────────────────────────────────────────────────────
// High-level payment service — orchestrates DB + provider
// ─────────────────────────────────────────────────────────────────────────────
export const paymentService = {
  /**
   * Initiate a payment for an existing order.
   * Creates a provider order and updates the Payment record.
   */
  async createPayment(orderId: string) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.payment?.status === "PAID") throw new Error("Order already paid");

    const provider = getProvider();
    const result = await provider.createOrder({
      orderId,
      amount: Number(order.totalAmount),
      currency: "INR",
      receipt: order.orderNumber,
    });

    // Update or create the payment record
    await db.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider: result.provider as any,
        providerOrderId: result.providerOrderId,
        status: "PENDING",
        amount: result.amount,
        currency: result.currency,
        metadata: JSON.stringify(result.metadata ?? {}),
      },
      update: {
        provider: result.provider as any,
        providerOrderId: result.providerOrderId,
        metadata: JSON.stringify(result.metadata ?? {}),
      },
    });

    return result;
  },

  /**
   * Verify a payment and update both Payment and Order records.
   */
  async verifyPayment(params: PaymentVerifyParams) {
    const provider = getProvider();
    const result = await provider.verifyPayment(params);

    if (result.success) {
      await db.$transaction([
        db.payment.update({
          where: { orderId: params.orderId },
          data: {
            status: "PAID",
            providerPaymentId: result.paymentId,
            providerSignature: params.signature,
            paidAt: new Date(),
          },
        }),
        db.order.update({
          where: { id: params.orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        }),
      ]);
    } else {
      await db.payment.update({
        where: { orderId: params.orderId },
        data: { status: "FAILED", failureReason: result.failureReason },
      });
    }

    return result;
  },

  /**
   * Refund a payment.
   */
  async refundPayment(orderId: string, amount?: number, reason?: string) {
    const payment = await db.payment.findUnique({ where: { orderId } });
    if (!payment || !payment.providerPaymentId) {
      throw new Error("Payment record not found or not yet completed");
    }

    const provider = getProvider();
    const result = await provider.refundPayment({
      providerPaymentId: payment.providerPaymentId,
      amount,
      reason,
    });

    if (result.success) {
      await db.$transaction([
        db.payment.update({
          where: { orderId },
          data: {
            status: "REFUNDED",
            refundId: result.refundId,
            refundAmount: amount ?? Number(payment.amount),
          },
        }),
        db.order.update({
          where: { id: orderId },
          data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
        }),
      ]);
    }

    return result;
  },
};
