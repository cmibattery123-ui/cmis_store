import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockPrismaClient,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

const { mockPrisma, mockAuth, mockCreatePayment, mockVerifyPayment } = vi.hoisted(() => ({
  mockPrisma: createMockPrismaClient(),
  mockAuth: vi.fn(),
  mockCreatePayment: vi.fn(),
  mockVerifyPayment: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  withDbRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/services/payments/payment-service", () => ({
  paymentService: {
    createPayment: (...args: unknown[]) => mockCreatePayment(...args),
    verifyPayment: (...args: unknown[]) => mockVerifyPayment(...args),
  },
}));

import { createOrder, verifyPayment } from "@/actions/orders";

describe("Tier 1 & Tier 2: Order Server Actions & Sequential ID Generation", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  const validCheckoutData = {
    shippingAddressId: "addr_ship_1",
    billingAddressId: "addr_bill_1",
    notes: "Please deliver before noon",
  };

  describe("createOrder Action", () => {
    it("fails with error if user is unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const result = await createOrder([{ productId: "p1", quantity: 1 }], validCheckoutData);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("log in");
    });

    it("fails with error if cart is empty", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u_cust", role: "CUSTOMER" } });
      const result = await createOrder([], validCheckoutData);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("cart is empty");
    });

    it("calculates customer price and taxes with sequential order number", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_cust", role: "CUSTOMER" } });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_battery_150",
          name: "Solar Tubular 150Ah",
          slug: "solar-tubular-150ah",
          sku: "ST-150",
          price: 10000,
          dealerPrice: 8000,
          taxRate: 18,
          stock: 20,
          isActive: true,
        },
      });

      mockCreatePayment.mockResolvedValueOnce({
        providerOrderId: "mock_order_12345",
        amount: 11800, // 10000 + 18% tax
        currency: "INR",
        provider: "MOCK",
      });

      const result = await createOrder(
        [{ productId: prod.id, quantity: 1 }],
        validCheckoutData
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.orderId).toBeDefined();
      }

      const store = getMockStore();
      expect(store.orders.length).toBe(1);
      const order = store.orders[0];
      expect(order.subtotal).toBe(10000);
      expect(order.taxAmount).toBe(1800);
      expect(order.totalAmount).toBe(11800);
      expect(order.status).toBe("PENDING");
      expect(order.paymentStatus).toBe("PENDING");
      expect(order.isDealer).toBe(false);

      const currentYear = new Date().getFullYear();
      expect(order.orderNumber).toBe(`PB-${currentYear}-00001`);
    });

    it("applies discounted dealer pricing for DEALER role", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_dealer", role: "DEALER" } });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_battery_200",
          name: "Solar Tubular 200Ah",
          slug: "solar-tubular-200ah",
          sku: "ST-200",
          price: 15000,
          dealerPrice: 12000,
          taxRate: 18,
          stock: 50,
          isActive: true,
        },
      });

      mockCreatePayment.mockResolvedValueOnce({
        providerOrderId: "mock_order_dealer_123",
        amount: 14160, // 12000 + 18% tax
        currency: "INR",
      });

      const result = await createOrder(
        [{ productId: prod.id, quantity: 1 }],
        validCheckoutData
      );

      expect(result.success).toBe(true);
      const store = getMockStore();
      const order = store.orders[0];
      // Dealer price applied: 12000 subtotal, 2160 tax (18%), 14160 total
      expect(order.subtotal).toBe(12000);
      expect(order.taxAmount).toBe(2160);
      expect(order.totalAmount).toBe(14160);
      expect(order.isDealer).toBe(true);
    });

    it("increments sequential order numbers accurately", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_cust", role: "CUSTOMER" } });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_1",
          name: "Battery 1",
          price: 5000,
          taxRate: 18,
          isActive: true,
        },
      });

      mockCreatePayment.mockResolvedValue({
        providerOrderId: "mock_order_x",
        amount: 5900,
      });

      const res1 = await createOrder([{ productId: prod.id, quantity: 1 }], validCheckoutData);
      const res2 = await createOrder([{ productId: prod.id, quantity: 1 }], validCheckoutData);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);

      const store = getMockStore();
      expect(store.orders.length).toBe(2);
      const currentYear = new Date().getFullYear();
      expect(store.orders[0].orderNumber).toBe(`PB-${currentYear}-00001`);
      expect(store.orders[1].orderNumber).toBe(`PB-${currentYear}-00002`);
    });
  });

  describe("verifyPayment Action", () => {
    it("fails with Unauthorized if not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const result = await verifyPayment({
        orderId: "ord_1",
        providerOrderId: "p_ord_1",
        providerPaymentId: "p_pay_1",
        signature: "sig_123",
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Unauthorized");
    });

    it("fails if required parameters are missing", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u_1", role: "CUSTOMER" } });
      const result = await verifyPayment({
        orderId: "ord_1",
        providerOrderId: "",
        providerPaymentId: "p_pay_1",
        signature: "",
      });
      expect(result.success).toBe(false);
    });

    it("successfully verifies payment and revalidates path", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u_1", role: "CUSTOMER" } });
      mockVerifyPayment.mockResolvedValueOnce({ success: true, paymentId: "mock_pay_999" });

      const result = await verifyPayment({
        orderId: "ord_1",
        providerOrderId: "mock_order_123",
        providerPaymentId: "mock_pay_999",
        signature: "sig_valid",
      });

      expect(result.success).toBe(true);
      expect(mockVerifyPayment).toHaveBeenCalledWith({
        orderId: "ord_1",
        providerOrderId: "mock_order_123",
        providerPaymentId: "mock_pay_999",
        signature: "sig_valid",
      });
    });
  });
});
