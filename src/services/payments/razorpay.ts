import crypto from "crypto";
import type {
  PaymentProvider,
  PaymentCreateParams,
  PaymentCreateResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
  PaymentRefundParams,
  PaymentRefundResult,
} from "./types";

/**
 * Razorpay payment provider.
 * Keys are loaded from environment variables — never hard-coded.
 * This is a placeholder until live Razorpay integration is enabled.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;
  private baseUrl = "https://api.razorpay.com/v1";

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID ?? "";
    this.keySecret = process.env.RAZORPAY_SECRET ?? "";

    if (!this.keyId || !this.keySecret) {
      console.warn(
        "[RazorpayProvider] RAZORPAY_KEY_ID or RAZORPAY_SECRET not set. " +
          "Using mock mode."
      );
    }
  }

  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
  }

  async createOrder(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    const body = {
      amount: Math.round(params.amount * 100), // Razorpay uses paise
      currency: params.currency ?? "INR",
      receipt: params.receipt ?? params.orderId,
      notes: params.notes ?? {},
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay order creation failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      providerOrderId: data.id,
      amount: data.amount / 100, // Convert back from paise
      currency: data.currency,
      provider: "RAZORPAY",
      metadata: data,
    };
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    if (!params.signature) {
      return { success: false, failureReason: "No signature provided" };
    }

    // Razorpay HMAC-SHA256 signature verification
    const payload = `${params.providerOrderId}|${params.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== params.signature) {
      return {
        success: false,
        failureReason: "Payment signature verification failed",
      };
    }

    return { success: true, paymentId: params.providerPaymentId };
  }

  async refundPayment(params: PaymentRefundParams): Promise<PaymentRefundResult> {
    const body: Record<string, unknown> = {};
    if (params.amount) {
      body.amount = Math.round(params.amount * 100); // paise
    }
    if (params.reason) {
      body.notes = { reason: params.reason };
    }

    const response = await fetch(
      `${this.baseUrl}/payments/${params.providerPaymentId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        failureReason: `Razorpay refund failed: ${JSON.stringify(error)}`,
      };
    }

    const data = await response.json();
    return { success: true, refundId: data.id };
  }
}
