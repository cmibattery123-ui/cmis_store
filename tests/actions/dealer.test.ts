import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createMockPrismaClient,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

const { mockPrisma, mockAuth } = vi.hoisted(() => ({
  mockPrisma: createMockPrismaClient(),
  mockAuth: vi.fn(),
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

import {
  registerDealer,
  updateDealerStatus,
  requestQuotation,
  processQuotation,
} from "@/actions/dealer";

describe("Tier 1 & Tier 2: Dealer Server Actions & Quotations", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  const validDealerFormData = {
    businessName: "Bright Power Systems",
    gstNumber: "07AAACB9876P1Z1",
    panNumber: "AAACB9876P",
    phone: "9876501234",
    businessAddress: "Plot 42, Okhla Industrial Area",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
  };

  describe("registerDealer Action", () => {
    it("fails with error if user is unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const result = await registerDealer(validDealerFormData);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("log in");
    });

    it("fails if user already has an active dealer application", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_dup", role: "CUSTOMER" } });

      await mockPrisma.dealer.create({
        data: {
          userId: "u_dup",
          businessName: "Existing Dealer Co",
          phone: "9876501234",
          businessAddress: "Some Road",
          city: "Delhi",
          state: "Delhi",
          pincode: "110020",
          status: "PENDING",
        },
      });

      const result = await registerDealer(validDealerFormData);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("already have a dealer application");
    });

    it("successfully creates dealer profile in PENDING status", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_new", role: "CUSTOMER" } });

      const result = await registerDealer(validDealerFormData);
      expect(result.success).toBe(true);

      const store = getMockStore();
      const dealer = store.dealers.find((d) => d.userId === "u_new");
      expect(dealer).toBeDefined();
      expect(dealer?.businessName).toBe("Bright Power Systems");
      expect(dealer?.status).toBe("PENDING");
    });
  });

  describe("updateDealerStatus Action (Admin)", () => {
    it("fails with Unauthorized if not ADMIN", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u_dealer", role: "DEALER" } });
      const result = await updateDealerStatus("d_1", "APPROVED");
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Unauthorized");
    });

    it("approving dealer elevates User.role to DEALER and creates notification", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      const user = await mockPrisma.user.create({
        data: {
          id: "u_pending_dealer",
          email: "pending@dealer.com",
          name: "Pending Dealer",
          role: "CUSTOMER", // Originally CUSTOMER
        },
      });

      const dealer = await mockPrisma.dealer.create({
        data: {
          id: "d_to_approve",
          userId: user.id,
          businessName: "Pending Energy Corp",
          phone: "9876543210",
          businessAddress: "Industrial Area",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          status: "PENDING",
        },
      });

      const result = await updateDealerStatus(dealer.id, "APPROVED");
      expect(result.success).toBe(true);

      const store = getMockStore();
      const updatedDealer = store.dealers.find((d) => d.id === dealer.id);
      expect(updatedDealer?.status).toBe("APPROVED");
      expect(updatedDealer?.approvedById).toBe("admin_1");

      const updatedUser = store.users.find((u) => u.id === user.id);
      expect(updatedUser?.role).toBe("DEALER"); // Role elevated!

      // Notification sent to user
      const notif = store.notifications.find((n) => n.userId === user.id);
      expect(notif).toBeDefined();
      expect(notif?.title).toContain("Approved");
    });
  });

  describe("requestQuotation Action (Dealer)", () => {
    it("fails if user is not DEALER or ADMIN", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u_cust", role: "CUSTOMER" } });
      const result = await requestQuotation({ items: [{ productId: "p1", quantity: 5 }] });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("Dealer access required");
    });

    it("fails if dealer profile is not APPROVED", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_pending", role: "DEALER" } });
      await mockPrisma.dealer.create({
        data: {
          id: "d_pending",
          userId: "u_pending",
          businessName: "Unapproved Dealer",
          status: "PENDING",
          phone: "9876543210",
          businessAddress: "Addr",
          city: "City",
          state: "State",
          pincode: "123456",
        },
      });

      const result = await requestQuotation({ items: [{ productId: "p1", quantity: 5 }] });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("must be approved first");
    });

    it("creates quotation request with sequential quotation number and dealer pricing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "u_approved", role: "DEALER" } });

      const dealer = await mockPrisma.dealer.create({
        data: {
          id: "d_approved",
          userId: "u_approved",
          businessName: "Solar Pro",
          status: "APPROVED",
          phone: "9876543210",
          businessAddress: "Addr",
          city: "City",
          state: "State",
          pincode: "123456",
        },
      });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_quote_1",
          name: "Inverter Tubular 220Ah",
          price: 18000,
          dealerPrice: 14000,
          taxRate: 18,
          isActive: true,
        },
      });

      const result = await requestQuotation({
        notes: "Need urgent bulk delivery",
        items: [{ productId: prod.id, quantity: 10 }],
      });

      expect(result.success).toBe(true);

      const store = getMockStore();
      expect(store.quotations.length).toBe(1);
      const quote = store.quotations[0];
      expect(quote.dealerId).toBe(dealer.id);
      expect(quote.status).toBe("PENDING");
      // 10 * 14000 = 140000 subtotal, 18% tax = 25200, total = 165200
      expect(quote.subtotal).toBe(140000);
      expect(quote.taxAmount).toBe(25200);
      expect(quote.totalAmount).toBe(165200);

      const currentYear = new Date().getFullYear();
      expect(quote.quotationNo).toBe(`QT-${currentYear}-00001`);
    });
  });

  describe("processQuotation Action (Admin)", () => {
    it("approves quotation with validity timestamp", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      const quote = await mockPrisma.quotation.create({
        data: {
          id: "quote_1",
          quotationNo: "QT-2026-00001",
          dealerId: "dealer_1",
          status: "PENDING",
          subtotal: 50000,
          taxAmount: 9000,
          totalAmount: 59000,
        },
      });

      const result = await processQuotation({
        quotationId: quote.id,
        status: "APPROVED",
        adminNotes: "Discount approved for 30 days",
        validDays: 30,
      });

      expect(result.success).toBe(true);

      const store = getMockStore();
      const updated = store.quotations.find((q) => q.id === quote.id);
      expect(updated?.status).toBe("APPROVED");
      expect(updated?.adminNotes).toBe("Discount approved for 30 days");
      expect(updated?.validUntil).toBeDefined();
      expect(updated?.approvedById).toBe("admin_1");
    });
  });
});
