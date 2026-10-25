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
  private customKeyId?: string;
  private customKeySecret?: string;

  constructor(keyId?: string, keySecret?: string) {
    this.customKeyId = keyId;
    this.customKeySecret = keySecret;
  }

  private get keyId(): string {
    return this.customKeyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  }

  private get keySecret(): string {
    return this.customKeySecret || process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";
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

    // Optionally create a hosted payment link as an unblocked alternative for direct checkout
    let paymentUrl: string | undefined;
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://13.205.205.233";
      const linkPayload: Record<string, unknown> = {
        amount: Math.round(Number(params.amount) * 100),
        currency: params.currency ?? "INR",
        description: `Order #${params.receipt ?? params.orderId}`,
        reference_id: params.orderId,
        callback_url: `${baseUrl}/api/payments/callback?orderId=${encodeURIComponent(params.orderId)}`,
        callback_method: "get",
      };

      if (params.customer) {
        linkPayload.customer = {
          name: params.customer.name || "Customer",
          email: params.customer.email || undefined,
          contact: params.customer.phone || undefined,
        };
      }

      const linkRes = await fetch(`${this.baseUrl}/payment_links`, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkPayload),
      });

      if (linkRes.ok) {
        const linkData = await linkRes.json();
        paymentUrl = linkData.short_url;
      }
    } catch (e) {
      console.warn("[Razorpay] Optional payment link generation skipped:", e);
    }

    return {
      providerOrderId: data.id,
      amount: Number(data.amount) / 100, // Convert back from paise
      currency: data.currency,
      provider: "RAZORPAY",
      paymentUrl,
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

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const sigBuf = Buffer.from(params.signature, "utf-8");

    if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
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
