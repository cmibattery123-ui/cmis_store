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

import { createOrder, verifyPayment } from "@/actions/orders";
import { GET as customerOrdersGET } from "@/app/api/customer/orders/route";
import { GET as adminOrdersGET } from "@/app/api/admin/orders/route";

describe("Tier 4: Realistic E2E Flow — Customer Shopping & Checkout Lifecycle", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  it("completes full flow: Browse -> Add To Cart -> Checkout -> Mock Payment -> Order Confirmed -> Visible in Admin & Customer Portals", async () => {
    // 1. Setup customer user & products in store
    const customer = await mockPrisma.user.create({
      data: {
        id: "cust_rohit",
        email: "rohit.sharma@example.com",
        name: "Rohit Sharma",
        phone: "9876543210",
        role: "CUSTOMER",
      },
    });

    const battery1 = await mockPrisma.product.create({
      data: {
        id: "prod_lead_acid_150",
        name: "Perfect Tall Tubular 150Ah Battery",
        slug: "perfect-tall-tubular-150ah-battery",
        sku: "PTT-150",
        price: 12000,
        dealerPrice: 9500,
        taxRate: 18,
        stock: 25,
        isActive: true,
      },
    });

    const battery2 = await mockPrisma.product.create({
      data: {
        id: "prod_inverter_900va",
        name: "Perfect Pure Sine Wave Inverter 900VA",
        slug: "perfect-pure-sine-wave-inverter-900va",
        sku: "PSI-900",
        price: 6000,
        dealerPrice: 4800,
        taxRate: 18,
        stock: 40,
        isActive: true,
      },
    });

    // 2. Customer logs in and prepares checkout payload
    mockAuth.mockResolvedValue({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: "CUSTOMER",
      },
    });

    const cartItems = [
      { productId: battery1.id, quantity: 2 }, // 2 * 12000 = 24000
      { productId: battery2.id, quantity: 1 }, // 1 * 6000  = 6000
    ];
    // Subtotal: 30000, Tax (18%): 5400, Total: 35400

    const checkoutData = {
      shippingAddressId: "addr_ship_rohit",
      billingAddressId: "addr_bill_rohit",
      notes: "Please call before delivery",
    };

    // 3. Initiate Checkout / Create Order
    const orderResult = await createOrder(cartItems, checkoutData);
    expect(orderResult.success).toBe(true);

    let orderId = "";
    let providerOrderId = "";
    if (orderResult.success && orderResult.data) {
      orderId = orderResult.data.orderId;
      providerOrderId = (orderResult.data.paymentOrder as any).providerOrderId;
    }

    expect(orderId).toBeTruthy();
    expect(providerOrderId).toBeTruthy();

    const store = getMockStore();
    const createdOrder = store.orders.find((o) => o.id === orderId);
    expect(createdOrder).toBeDefined();
    expect(createdOrder?.subtotal).toBe(30000);
    expect(createdOrder?.taxAmount).toBe(5400);
    expect(createdOrder?.totalAmount).toBe(35400);
    expect(createdOrder?.status).toBe("PENDING");
    expect(createdOrder?.paymentStatus).toBe("PENDING");

    // Order items created in DB
    const items = store.orderItems.filter((i) => i.orderId === orderId);
    expect(items).toHaveLength(2);

    // 4. Simulate Payment Gateway Success (Customer completes mock payment)
    const mockPaymentId = `mock_pay_${Date.now()}_success`;
    const verifyResult = await verifyPayment({
      orderId,
      providerOrderId,
      providerPaymentId: mockPaymentId,
      signature: "mock_signature_valid",
    });

    expect(verifyResult.success).toBe(true);

    // 5. Verify DB State after Payment
    const updatedOrder = store.orders.find((o) => o.id === orderId);
    expect(updatedOrder?.status).toBe("CONFIRMED");
    expect(updatedOrder?.paymentStatus).toBe("PAID");

    const paymentRecord = store.payments.find((p) => p.orderId === orderId);
    expect(paymentRecord?.status).toBe("PAID");
    expect(paymentRecord?.providerPaymentId).toBe(mockPaymentId);
    expect(paymentRecord?.paidAt).toBeDefined();

    // 6. Verify Customer Portal API returns this confirmed order
    const custReq = new Request("http://localhost:3000/api/customer/orders");
    const custRes = await customerOrdersGET(custReq);
    expect(custRes.status).toBe(200);
    const custJson = await custRes.json();
    expect(custJson.data.orders).toHaveLength(1);
    expect(custJson.data.orders[0].id).toBe(orderId);
    expect(custJson.data.orders[0].status).toBe("CONFIRMED");

    // 7. Verify Admin Portal API returns this confirmed order
    mockAuth.mockResolvedValue({
      user: { id: "admin_super", role: "ADMIN" },
    });
    const adminReq = new Request("http://localhost:3000/api/admin/orders");
    const adminRes = await adminOrdersGET(adminReq);
    expect(adminRes.status).toBe(200);
    const adminJson = await adminRes.json();
    const adminFound = adminJson.data.orders.find((o: any) => o.id === orderId);
    expect(adminFound).toBeDefined();
    expect(adminFound.paymentStatus).toBe("PAID");
  });
});
