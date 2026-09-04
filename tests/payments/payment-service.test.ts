import { describe, it, expect, beforeEach, vi } from "vitest";
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

import { MockPaymentProvider } from "@/services/payments/mock-payment";
import { paymentService } from "@/services/payments/payment-service";

describe("Tier 1 & Tier 2: Payment Gateway & Mock Provider Lifecycle", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  describe("MockPaymentProvider", () => {
    const mockProvider = new MockPaymentProvider();

    it("creates mock order with mock_order_ prefix", async () => {
      const result = await mockProvider.createOrder({
        orderId: "order_123456",
        amount: 15000,
        currency: "INR",
        receipt: "PB-2026-00001",
      });

      expect(result.providerOrderId).toContain("mock_order_");
      expect(result.amount).toBe(15000);
      expect(result.currency).toBe("INR");
      expect(result.provider).toBe("MOCK");
    });

    it("verifies payment successfully when paymentId starts with mock_pay_", async () => {
      const result = await mockProvider.verifyPayment({
        orderId: "ord_1",
        providerOrderId: "mock_order_123",
        providerPaymentId: "mock_pay_valid_999",
        signature: "mock_sig",
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe("mock_pay_valid_999");
    });

    it("fails payment verification when paymentId does not start with mock_pay_", async () => {
      const result = await mockProvider.verifyPayment({
        orderId: "ord_1",
        providerOrderId: "mock_order_123",
        providerPaymentId: "invalid_pay_id",
        signature: "mock_sig",
      });

      expect(result.success).toBe(false);
      expect(result.failureReason).toContain("invalid payment ID format");
    });

    it("refunds payment successfully with mock refund ID", async () => {
      const result = await mockProvider.refundPayment({
        providerPaymentId: "mock_pay_123",
        amount: 5000,
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toContain("mock_refund_");
    });
  });

  describe("PaymentService Orchestration with Database", () => {
    it("createPayment: creates payment order and saves PENDING record in DB", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_test_1",
          orderNumber: "PB-2026-00001",
          userId: "user_1",
          totalAmount: 11800,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      const paymentResult = await paymentService.createPayment(order.id);
      expect(paymentResult.providerOrderId).toContain("mock_order_");

      const store = getMockStore();
      const payment = store.payments.find((p) => p.orderId === order.id);
      expect(payment).toBeDefined();
      expect(payment?.status).toBe("PENDING");
      expect(payment?.amount).toBe(11800);
      expect(payment?.providerOrderId).toBe(paymentResult.providerOrderId);
    });

    it("createPayment: throws if order does not exist", async () => {
      await expect(paymentService.createPayment("non_existent_order")).rejects.toThrow(
        "Order not found"
      );
    });

    it("createPayment: throws if order is already PAID", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_already_paid",
          orderNumber: "PB-2026-00002",
          userId: "user_1",
          totalAmount: 5000,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          payment: {
            create: {
              status: "PAID",
              amount: 5000,
              provider: "MOCK",
            },
          },
        },
      });

      await expect(paymentService.createPayment(order.id)).rejects.toThrow(
        "Order already paid"
      );
    });

    it("verifyPayment: success updates payment to PAID and order to CONFIRMED", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_verify_success",
          orderNumber: "PB-2026-00003",
          userId: "user_1",
          totalAmount: 9000,
          status: "PENDING",
          paymentStatus: "PENDING",
          payment: {
            create: {
              status: "PENDING",
              amount: 9000,
              provider: "MOCK",
            },
          },
        },
      });

      const verifyResult = await paymentService.verifyPayment({
        orderId: order.id,
        providerOrderId: "mock_order_123",
        providerPaymentId: "mock_pay_success_123",
        signature: "sig_abc",
      });

      expect(verifyResult.success).toBe(true);

      const store = getMockStore();
      const payment = store.payments.find((p) => p.orderId === order.id);
      expect(payment?.status).toBe("PAID");
      expect(payment?.providerPaymentId).toBe("mock_pay_success_123");
      expect(payment?.paidAt).toBeDefined();

      const updatedOrder = store.orders.find((o) => o.id === order.id);
      expect(updatedOrder?.status).toBe("CONFIRMED");
      expect(updatedOrder?.paymentStatus).toBe("PAID");
    });

    it("verifyPayment: failure updates payment to FAILED with reason", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_verify_fail",
          orderNumber: "PB-2026-00004",
          userId: "user_1",
          totalAmount: 9000,
          status: "PENDING",
          paymentStatus: "PENDING",
          payment: {
            create: {
              status: "PENDING",
              amount: 9000,
              provider: "MOCK",
            },
          },
        },
      });

      const verifyResult = await paymentService.verifyPayment({
        orderId: order.id,
        providerOrderId: "mock_order_123",
        providerPaymentId: "bad_payment_id", // Invalid for MockProvider
        signature: "sig_abc",
      });

      expect(verifyResult.success).toBe(false);

      const store = getMockStore();
      const payment = store.payments.find((p) => p.orderId === order.id);
      expect(payment?.status).toBe("FAILED");
      expect(payment?.failureReason).toBeDefined();
    });

    it("refundPayment: processes refund and updates DB status", async () => {
      const order = await mockPrisma.order.create({
        data: {
          id: "order_refund_test",
          orderNumber: "PB-2026-00005",
          userId: "user_1",
          totalAmount: 10000,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          payment: {
            create: {
              status: "PAID",
              amount: 10000,
              providerPaymentId: "mock_pay_12345",
              provider: "MOCK",
            },
          },
        },
      });

      const refundResult = await paymentService.refundPayment(order.id, 10000, "Customer cancellation");
      expect(refundResult.success).toBe(true);

      const store = getMockStore();
      const payment = store.payments.find((p) => p.orderId === order.id);
      expect(payment?.status).toBe("REFUNDED");
      expect(payment?.refundId).toBeDefined();

      const updatedOrder = store.orders.find((o) => o.id === order.id);
      expect(updatedOrder?.status).toBe("REFUNDED");
      expect(updatedOrder?.paymentStatus).toBe("REFUNDED");
    });
  });
});
