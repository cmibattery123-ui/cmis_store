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
  auth: (req?: unknown) => mockAuth(req),
  getDbUserFromSession: vi.fn(async (session: { user?: { id?: string; email?: string } } | null) => {
    if (!session?.user) return null;
    const email = session.user.email?.toLowerCase();
    const id = session.user.id;
    const store = getMockStore();
    return store.users.find((u) => u.id === id || (email && u.email === email)) || null;
  }),
}));

import { GET as adminOrdersGET, PATCH as adminOrdersPATCH } from "@/app/api/admin/orders/route";
import { GET as dealerQuotationsGET, POST as dealerQuotationsPOST } from "@/app/api/dealer/quotations/route";
import { GET as customerOrdersGET } from "@/app/api/customer/orders/route";

describe("Tier 1 & Tier 2: API Route Role Guards & Error Sanitization", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  describe("Admin API Endpoints (/api/admin/orders)", () => {
    it("returns 403 Forbidden when unauthenticated or non-admin calls GET", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const req1 = new Request("http://localhost:3000/api/admin/orders");
      const res1 = await adminOrdersGET(req1);
      expect(res1.status).toBe(403);

      mockAuth.mockResolvedValueOnce({ user: { id: "u_cust", role: "CUSTOMER" } });
      const req2 = new Request("http://localhost:3000/api/admin/orders");
      const res2 = await adminOrdersGET(req2);
      expect(res2.status).toBe(403);

      mockAuth.mockResolvedValueOnce({ user: { id: "u_dealer", role: "DEALER" } });
      const req3 = new Request("http://localhost:3000/api/admin/orders");
      const res3 = await adminOrdersGET(req3);
      expect(res3.status).toBe(403);
    });

    it("returns 200 and orders list when ADMIN calls GET", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      await mockPrisma.order.create({
        data: {
          orderNumber: "PB-2026-00001",
          userId: "u_cust",
          status: "CONFIRMED",
          paymentStatus: "PAID",
          subtotal: 10000,
          taxAmount: 1800,
          shippingAmount: 0,
          totalAmount: 11800,
        },
      });

      const req = new Request("http://localhost:3000/api/admin/orders");
      const res = await adminOrdersGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.orders).toHaveLength(1);
      expect(json.data.orders[0].orderNumber).toBe("PB-2026-00001");
    });

    it("updates order status when ADMIN calls PATCH with valid payload", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      const order = await mockPrisma.order.create({
        data: {
          id: "ord_to_ship",
          orderNumber: "PB-2026-00002",
          userId: "u_cust",
          status: "CONFIRMED",
          paymentStatus: "PAID",
          subtotal: 5000,
          taxAmount: 900,
          shippingAmount: 0,
          totalAmount: 5900,
        },
      });

      const req = new Request("http://localhost:3000/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: "SHIPPED" }),
      });

      const res = await adminOrdersPATCH(req);
      expect(res.status).toBe(200);

      const store = getMockStore();
      const updated = store.orders.find((o) => o.id === order.id);
      expect(updated?.status).toBe("SHIPPED");
    });
  });

  describe("Dealer API Endpoints (/api/dealer/quotations)", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const req = new Request("http://localhost:3000/api/dealer/quotations");
      const res = await dealerQuotationsGET(req);
      expect(res.status).toBe(401);
    });

    it("returns 404 if user has no dealer profile", async () => {
      await mockPrisma.user.create({
        data: {
          id: "u_no_dealer",
          email: "nodealer@example.com",
          role: "CUSTOMER",
        },
      });

      mockAuth.mockResolvedValue({ user: { id: "u_no_dealer", email: "nodealer@example.com", role: "CUSTOMER" } });
      const req = new Request("http://localhost:3000/api/dealer/quotations");
      const res = await dealerQuotationsGET(req);
      expect(res.status).toBe(404);
    });

    it("returns 403 on POST if dealer is not yet APPROVED", async () => {
      const user = await mockPrisma.user.create({
        data: { id: "u_dealer_p", email: "p@dealer.com", role: "DEALER" },
      });

      await mockPrisma.dealer.create({
        data: {
          userId: user.id,
          businessName: "Pending Co",
          status: "PENDING",
          phone: "9876543210",
          businessAddress: "Addr",
          city: "City",
          state: "State",
          pincode: "123456",
        },
      });

      mockAuth.mockResolvedValue({ user: { id: user.id, email: user.email, role: "DEALER" } });
      const req = new Request("http://localhost:3000/api/dealer/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
      });

      const res = await dealerQuotationsPOST(req);
      expect(res.status).toBe(403);
    });

    it("returns 200 on GET for approved dealer", async () => {
      const user = await mockPrisma.user.create({
        data: { id: "u_dealer_app", email: "app@dealer.com", role: "DEALER" },
      });

      const dealer = await mockPrisma.dealer.create({
        data: {
          id: "d_approved_1",
          userId: user.id,
          businessName: "Approved Dealer Co",
          status: "APPROVED",
          phone: "9876543210",
          businessAddress: "Addr",
          city: "City",
          state: "State",
          pincode: "123456",
        },
      });

      await mockPrisma.quotation.create({
        data: {
          quotationNo: "QT-2026-00001",
          dealerId: dealer.id,
          status: "APPROVED",
          subtotal: 20000,
          taxAmount: 3600,
          totalAmount: 23600,
        },
      });

      mockAuth.mockResolvedValue({ user: { id: user.id, email: user.email, role: "DEALER" } });
      const req = new Request("http://localhost:3000/api/dealer/quotations");
      const res = await dealerQuotationsGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.quotations).toHaveLength(1);
    });
  });

  describe("Customer API Endpoints (/api/customer/orders)", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const req = new Request("http://localhost:3000/api/customer/orders");
      const res = await customerOrdersGET(req);
      expect(res.status).toBe(401);
    });

    it("returns customer orders list for authenticated customer", async () => {
      const user = await mockPrisma.user.create({
        data: { id: "u_cust_10", email: "cust10@example.com", role: "CUSTOMER" },
      });

      await mockPrisma.order.create({
        data: {
          orderNumber: "PB-2026-00010",
          userId: user.id,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          subtotal: 8000,
          taxAmount: 1440,
          shippingAmount: 0,
          totalAmount: 9440,
        },
      });

      mockAuth.mockResolvedValue({ user: { id: user.id, email: user.email, role: "CUSTOMER" } });
      const req = new Request("http://localhost:3000/api/customer/orders");
      const res = await customerOrdersGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data.orders).toHaveLength(1);
      expect(json.data.orders[0].orderNumber).toBe("PB-2026-00010");
    });
  });

  describe("API Error Sanitization (Zero Leakage)", () => {
    it("500 responses return clean sanitized JSON and never expose stack trace or DB credentials", async () => {
      mockAuth.mockImplementationOnce(() => {
        throw new Error("FATAL: postgresql://postgres:SecretPassword123@supabase.co:5432/db connection failed at Pool.connect");
      });

      const req = new Request("http://localhost:3000/api/admin/orders");
      const res = await adminOrdersGET(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.error).toBe("Internal server error");
      expect(JSON.stringify(json)).not.toContain("postgres");
      expect(JSON.stringify(json)).not.toContain("SecretPassword123");
      expect(JSON.stringify(json)).not.toContain("supabase.co");
    });
  });
});
