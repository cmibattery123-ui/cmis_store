import crypto from "node:crypto";
import { Buffer } from "node:buffer";
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
 * Razorpay payment provider for Cloudflare Workers & Serverless.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  private baseUrl = "https://api.razorpay.com/v1";

  private get keyId(): string {
    return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  }

  private get keySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";
  }

  private get authHeader(): string {
    const creds = `${this.keyId}:${this.keySecret}`;
    try {
      if (typeof btoa === "function") {
        return `Basic ${btoa(creds)}`;
      }
    } catch {}
    return `Basic ${Buffer.from(creds, "utf-8").toString("base64")}`;
  }

  async createOrder(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    const body = {
      amount: Math.round(Number(params.amount) * 100), // Razorpay uses paise
      currency: params.currency ?? "INR",
      receipt: String(params.receipt ?? params.orderId).slice(0, 40),
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
      const errorText = await response.text();
      throw new Error(`Razorpay order creation failed (${response.status}): ${errorText}`);
    }

    const data: any = await response.json();
    return {
      providerOrderId: data.id,
      amount: Number(data.amount) / 100, // Convert back from paise
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
      const errorText = await response.text();
      return {
        success: false,
        failureReason: `Razorpay refund failed: ${errorText}`,
      };
    }

    const data: any = await response.json();
    return { success: true, refundId: data.id };
  }
}
