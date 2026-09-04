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

import { GET as cartGET, POST as cartPOST } from "@/app/api/cart/route";

describe("Tier 4: Realistic E2E Flow — Cart Synchronization & Item Management", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  it("handles guest cart sync on login, item additions, quantity updates and removals without N+1 query overhead", async () => {
    // 1. Setup user & products
    const user = await mockPrisma.user.create({
      data: {
        id: "u_priya",
        email: "priya@example.com",
        name: "Priya Nair",
        role: "CUSTOMER",
      },
    });

    const p1 = await mockPrisma.product.create({
      data: {
        id: "cmis-prod-001",
        name: "Perfect Solar Battery 100Ah",
        slug: "perfect-solar-battery-100ah",
        sku: "PSB-100",
        price: 9000,
        dealerPrice: 7500,
        taxRate: 18,
        stock: 30,
        isActive: true,
      },
    });

    const p2 = await mockPrisma.product.create({
      data: {
        id: "cmis-prod-002",
        name: "Perfect Inverter Battery 150Ah",
        slug: "perfect-inverter-battery-150ah",
        sku: "PIB-150",
        price: 13000,
        dealerPrice: 10500,
        taxRate: 18,
        stock: 15,
        isActive: true,
      },
    });

    mockAuth.mockResolvedValue({
      user: { id: user.id, email: user.email, role: "CUSTOMER" },
    });

    // 2. Sync local offline cart on login (action: "sync")
    const syncReq = new Request("http://localhost:3000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sync",
        items: [
          { productId: p1.id, quantity: 2 },
          { productId: p2.id, quantity: 1 },
        ],
      }),
    });

    const syncRes = await cartPOST(syncReq);
    expect(syncRes.status).toBe(200);

    const store = getMockStore();
    expect(store.cartItems.length).toBe(2);

    // 3. Fetch Cart via GET
    const getReq1 = new Request("http://localhost:3000/api/cart");
    const getRes1 = await cartGET(getReq1);
    expect(getRes1.status).toBe(200);
    const cartData1 = await getRes1.json();
    expect(cartData1.data.items).toHaveLength(2);

    const item1 = cartData1.data.items.find((i: any) => i.productId === p1.id);
    expect(item1?.quantity).toBe(2);
    expect(item1?.price).toBe(9000);

    // 4. Update quantity of p1 to 5 (action: "update")
    const updateReq = new Request("http://localhost:3000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        productId: p1.id,
        quantity: 5,
      }),
    });

    const updateRes = await cartPOST(updateReq);
    expect(updateRes.status).toBe(200);

    const p1CartItem = store.cartItems.find((i) => i.productId === p1.id);
    expect(p1CartItem?.quantity).toBe(5);

    // 5. Remove item p2 from cart (action: "remove")
    const removeReq = new Request("http://localhost:3000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remove",
        productId: p2.id,
      }),
    });

    const removeRes = await cartPOST(removeReq);
    expect(removeRes.status).toBe(200);

    const p2CartItem = store.cartItems.find((i) => i.productId === p2.id);
    expect(p2CartItem).toBeUndefined();

    // 6. Verify GET returns only 1 item with quantity 5
    const getReq2 = new Request("http://localhost:3000/api/cart");
    const getRes2 = await cartGET(getReq2);
    const cartData2 = await getRes2.json();
    expect(cartData2.data.items).toHaveLength(1);
    expect(cartData2.data.items[0].productId).toBe(p1.id);
    expect(cartData2.data.items[0].quantity).toBe(5);

    // 7. Clear cart (action: "clear")
    const clearReq = new Request("http://localhost:3000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });

    const clearRes = await cartPOST(clearReq);
    expect(clearRes.status).toBe(200);
    expect(store.cartItems.length).toBe(0);
  });
});
