import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "node:crypto";
import {
  createMockPrismaClient,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: createMockPrismaClient(),
}));

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  withDbRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

import { RazorpayPaymentProvider } from "@/services/payments/razorpay";
import { POST as razorpayWebhookPOST } from "@/app/api/webhooks/razorpay/route";

describe("Tier 1 & Tier 2: Razorpay Verification & Webhook HMAC Security", () => {
  const secretKey = "test_webhook_secret_key_12345";

  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = "rzp_test_12345";
    process.env.RAZORPAY_KEY_SECRET = secretKey;
    process.env.RAZORPAY_WEBHOOK_SECRET = secretKey;
  });

  describe("RazorpayPaymentProvider Signature Verification", () => {
    it("verifies authentic HMAC-SHA256 signatures", async () => {
      const provider = new RazorpayPaymentProvider();
      const orderId = "order_rzp_999";
      const paymentId = "pay_rzp_888";

      const payload = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(payload)
        .digest("hex");

      const result = await provider.verifyPayment({
        orderId: "ord_1",
        providerOrderId: orderId,
        providerPaymentId: paymentId,
        signature: validSignature,
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe(paymentId);
    });

    it("rejects forged or tampered signatures", async () => {
      const provider = new RazorpayPaymentProvider();

      const result = await provider.verifyPayment({
        orderId: "ord_1",
        providerOrderId: "order_rzp_999",
        providerPaymentId: "pay_rzp_888",
        signature: "forged_signature_hex_value",
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain("verification failed");
    });

    it("rejects when signature is missing", async () => {
      const provider = new RazorpayPaymentProvider();

      const result = await provider.verifyPayment({
        orderId: "ord_1",
        providerOrderId: "order_rzp_999",
        providerPaymentId: "pay_rzp_888",
        signature: "",
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain("No signature");
    });
  });

  describe("POST /api/webhooks/razorpay Handler", () => {
    it("returns 400 if x-razorpay-signature header is missing", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        body: JSON.stringify({ event: "payment.captured" }),
      });

      const res = await razorpayWebhookPOST(req as any);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("Missing x-razorpay-signature");
    });

    it("returns 400 if HMAC signature is invalid", async () => {
      const rawBody = JSON.stringify({ event: "payment.captured" });
      const req = new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "x-razorpay-signature": "invalid_hex_signature_12345",
        },
        body: rawBody,
      });

      const res = await razorpayWebhookPOST(req as any);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("Invalid webhook signature");
    });

    it("processes payment.captured event and updates payment & order status to PAID", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_wh_1",
          orderNumber: "PB-2026-00001",
          userId: "user_1",
          totalAmount: 11800,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      const payment = await mockPrisma.payment.create({
        data: {
          orderId: order.id,
          providerOrderId: "order_RzpOrder_12345",
          status: "PENDING",
          amount: 11800,
          provider: "RAZORPAY",
        },
      });

      const eventPayload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_RzpPayment_67890",
              order_id: "order_RzpOrder_12345",
              amount: 1180000, // paise
              currency: "INR",
              status: "captured",
            },
          },
        },
      };

      const rawBody = JSON.stringify(eventPayload);
      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawBody)
        .digest("hex");

      const req = new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "x-razorpay-signature": validSignature,
        },
        body: rawBody,
      });

      const res = await razorpayWebhookPOST(req as any);
      expect(res.status).toBe(200);

      const store = getMockStore();
      const updatedPayment = store.payments.find((p) => p.id === payment.id);
      expect(updatedPayment?.status).toBe("PAID");
      expect(updatedPayment?.providerPaymentId).toBe("pay_RzpPayment_67890");

      const updatedOrder = store.orders.find((o) => o.id === order.id);
      expect(updatedOrder?.status).toBe("CONFIRMED");
      expect(updatedOrder?.paymentStatus).toBe("PAID");
    });

    it("processes payment.failed event and updates payment & order status to FAILED", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_wh_fail",
          orderNumber: "PB-2026-00002",
          userId: "user_1",
          totalAmount: 5000,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      const payment = await mockPrisma.payment.create({
        data: {
          orderId: order.id,
          providerOrderId: "order_RzpOrder_failed",
          status: "PENDING",
          amount: 5000,
          provider: "RAZORPAY",
        },
      });

      const eventPayload = {
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_failed_111",
              order_id: "order_RzpOrder_failed",
              error_description: "Card declined by bank",
            },
          },
        },
      };

      const rawBody = JSON.stringify(eventPayload);
      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawBody)
        .digest("hex");

      const req = new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "x-razorpay-signature": validSignature,
        },
        body: rawBody,
      });

      const res = await razorpayWebhookPOST(req as any);
      expect(res.status).toBe(200);

      const store = getMockStore();
      const updatedPayment = store.payments.find((p) => p.id === payment.id);
      expect(updatedPayment?.status).toBe("FAILED");
      expect(updatedPayment?.failureReason).toBe("Card declined by bank");

      const updatedOrder = store.orders.find((o) => o.id === order.id);
      expect(updatedOrder?.status).toBe("FAILED");
      expect(updatedOrder?.paymentStatus).toBe("FAILED");
    });

    it("ensures idempotency: already PAID payment is not modified", async () => {
      const existingPaidDate = new Date("2026-01-01T10:00:00Z");

      const order = await mockPrisma.order.create({
        data: {
          id: "order_wh_idempotent",
          orderNumber: "PB-2026-00003",
          userId: "user_1",
          totalAmount: 7000,
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      });

      const payment = await mockPrisma.payment.create({
        data: {
          orderId: order.id,
          providerOrderId: "order_RzpOrder_idempotent",
          providerPaymentId: "pay_original",
          status: "PAID",
          paidAt: existingPaidDate,
          amount: 7000,
          provider: "RAZORPAY",
        },
      });

      const eventPayload = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_duplicate_delivery",
              order_id: "order_RzpOrder_idempotent",
              amount: 700000,
            },
          },
        },
      };

      const rawBody = JSON.stringify(eventPayload);
      const validSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawBody)
        .digest("hex");

      const req = new Request("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "x-razorpay-signature": validSignature,
        },
        body: rawBody,
      });

      const res = await razorpayWebhookPOST(req as any);
      expect(res.status).toBe(200);

      const store = getMockStore();
      const currentPayment = store.payments.find((p) => p.id === payment.id);
      // Original payment ID and timestamp preserved
      expect(currentPayment?.providerPaymentId).toBe("pay_original");
      expect(currentPayment?.paidAt).toEqual(existingPaidDate);
    });
  });
});
