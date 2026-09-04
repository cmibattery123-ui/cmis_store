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
  getDbUserFromSession: vi.fn(async (session: { user?: { id?: string } } | null) => {
    if (!session?.user) return null;
    const store = getMockStore();
    return store.users.find((u) => u.id === session.user!.id) || null;
  }),
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
import { GET as dealerQuotationsGET } from "@/app/api/dealer/quotations/route";

describe("Tier 4: Realistic E2E Flow — Dealer B2B Registration, Approval & Quotation", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  it("executes complete B2B flow: Application -> Approval -> Quotation Request -> Admin Pricing Approval", async () => {
    // 1. Initial User (starts as CUSTOMER)
    const user = await mockPrisma.user.create({
      data: {
        id: "u_vikram",
        email: "vikram@vikramsolar.in",
        name: "Vikram Mehta",
        phone: "9876543210",
        role: "CUSTOMER",
      },
    });

    const product1 = await mockPrisma.product.create({
      data: {
        id: "prod_bulk_battery_200",
        name: "Perfect Solar Commercial 200Ah",
        slug: "perfect-solar-commercial-200ah",
        sku: "PSC-200",
        price: 20000,
        dealerPrice: 15000, // Dealer discount: 5000 off
        taxRate: 18,
        stock: 100,
        isActive: true,
      },
    });

    // 2. User submits dealer registration application
    mockAuth.mockResolvedValue({
      user: { id: user.id, email: user.email, role: "CUSTOMER" },
    });

    const regResult = await registerDealer({
      businessName: "Vikram Solar & Power Solutions",
      gstNumber: "24AAECV3456P1Z3",
      panNumber: "AAECV3456P",
      phone: "9876543210",
      businessAddress: "45 GIDC Industrial Area",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
    });

    expect(regResult.success).toBe(true);

    const store = getMockStore();
    const dealer = store.dealers.find((d) => d.userId === user.id);
    expect(dealer).toBeDefined();
    expect(dealer?.status).toBe("PENDING");

    // 3. User cannot request quotation while still PENDING
    const prematureQuote = await requestQuotation({
      items: [{ productId: product1.id, quantity: 20 }],
    });
    expect(prematureQuote.success).toBe(false);

    // 4. Admin reviews and APPROVES dealer application
    mockAuth.mockResolvedValue({
      user: { id: "admin_super", role: "ADMIN" },
    });

    const approveResult = await updateDealerStatus(dealer!.id, "APPROVED");
    expect(approveResult.success).toBe(true);

    // Verify role elevation to DEALER
    const updatedUser = store.users.find((u) => u.id === user.id);
    expect(updatedUser?.role).toBe("DEALER");

    // Notification created
    const notif = store.notifications.find((n) => n.userId === user.id);
    expect(notif).toBeDefined();
    expect(notif?.title).toContain("Approved");

    // 5. Dealer requests bulk quotation for 20 units
    mockAuth.mockResolvedValue({
      user: { id: user.id, email: user.email, role: "DEALER" },
    });

    const quoteResult = await requestQuotation({
      notes: "Need delivery to Ahmedabad warehouse by end of month",
      items: [{ productId: product1.id, quantity: 20 }],
    });

    expect(quoteResult.success).toBe(true);

    expect(store.quotations.length).toBe(1);
    const quotation = store.quotations[0];
    // 20 * 15000 = 300,000 subtotal; 18% tax = 54,000; total = 354,000
    expect(quotation.subtotal).toBe(300000);
    expect(quotation.taxAmount).toBe(54000);
    expect(quotation.totalAmount).toBe(354000);
    expect(quotation.status).toBe("PENDING");

    const currentYear = new Date().getFullYear();
    expect(quotation.quotationNo).toBe(`QT-${currentYear}-00001`);

    // 6. Admin approves quotation with 45 days validity
    mockAuth.mockResolvedValue({
      user: { id: "admin_super", role: "ADMIN" },
    });

    const processResult = await processQuotation({
      quotationId: quotation.id,
      status: "APPROVED",
      adminNotes: "Bulk discount confirmed for 20 units",
      validDays: 45,
    });

    expect(processResult.success).toBe(true);

    const approvedQuote = store.quotations.find((q) => q.id === quotation.id);
    expect(approvedQuote?.status).toBe("APPROVED");
    expect(approvedQuote?.validUntil).toBeDefined();

    // 7. Dealer verifies approved quotation via API
    mockAuth.mockResolvedValue({
      user: { id: user.id, email: user.email, role: "DEALER" },
    });

    const req = new Request("http://localhost:3000/api/dealer/quotations");
    const res = await dealerQuotationsGET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.quotations).toHaveLength(1);
    expect(json.data.quotations[0].id).toBe(quotation.id);
    expect(json.data.quotations[0].status).toBe("APPROVED");
  });
});
