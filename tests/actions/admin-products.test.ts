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
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/admin/products";

describe("Tier 1 & Tier 2: Admin Product Server Actions & Zod Validation", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  const validProductInput = {
    name: "Perfect Solar Tubular Battery 150Ah",
    description: "High performance deep cycle tubular battery for solar and inverter applications.",
    sku: "PST-150AH",
    price: 14500,
    dealerPrice: 11800,
    taxRate: 18,
    stock: 50,
    categoryId: "cat_tubular",
    warrantyMonths: 36,
    weight: 48.5,
    isActive: true,
    isFeatured: true,
    specs: [
      { label: "Capacity", value: "150Ah" },
      { label: "Voltage", value: "12V" },
    ],
  };

  describe("createProduct Action", () => {
    it("fails with Unauthorized if user is not authenticated or not ADMIN", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const res1 = await createProduct(validProductInput);
      expect(res1.success).toBe(false);
      if (!res1.success) expect(res1.error).toBe("Unauthorized");

      mockAuth.mockResolvedValueOnce({ user: { id: "u_1", role: "CUSTOMER" } });
      const res2 = await createProduct(validProductInput);
      expect(res2.success).toBe(false);
      if (!res2.success) expect(res2.error).toBe("Unauthorized");

      mockAuth.mockResolvedValueOnce({ user: { id: "u_2", role: "DEALER" } });
      const res3 = await createProduct(validProductInput);
      expect(res3.success).toBe(false);
      if (!res3.success) expect(res3.error).toBe("Unauthorized");
    });

    it("fails on Zod validation errors (e.g., negative price, missing name)", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "admin_1", role: "ADMIN" } });

      const invalidInput = {
        ...validProductInput,
        name: "", // Invalid: min 2 chars
        price: -500, // Invalid: must be positive
      };

      const result = await createProduct(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Validation failed");
        expect(result.fieldErrors).toBeDefined();
      }
    });

    it("creates product with generated slug and inventory record when valid", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "admin_1", role: "ADMIN" } });

      const result = await createProduct(validProductInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.message).toContain("successfully");
      }

      const store = getMockStore();
      const product = store.products.find((p) => p.sku === "PST-150AH");
      expect(product).toBeDefined();
      expect(product?.slug).toBe("perfect-solar-tubular-battery-150ah");
      expect(product?.price).toBe(14500);

      // Inventory should have been created
      const inv = store.inventories.find((i) => i.productId === product?.id);
      expect(inv).toBeDefined();
      expect(inv?.quantity).toBe(0);
    });

    it("rejects duplicate product creation with same slug", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      // First create
      await createProduct(validProductInput);

      // Second create with same name -> duplicate slug
      const result = await createProduct(validProductInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("already exists");
      }
    });
  });

  describe("updateProduct Action", () => {
    it("fails with Unauthorized if user is not ADMIN", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "cust_1", role: "CUSTOMER" } });
      const result = await updateProduct("prod_1", validProductInput);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Unauthorized");
    });

    it("fails if product ID is missing", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "admin_1", role: "ADMIN" } });
      const result = await updateProduct("", validProductInput);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("required");
    });

    it("successfully updates existing product details in DB", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_to_update",
          name: "Old Battery Name",
          slug: "old-battery-name",
          description: "Old description for testing updates.",
          sku: "OLD-SKU-1",
          price: 10000,
          dealerPrice: 8000,
          taxRate: 18,
          stock: 10,
          categoryId: "cat_1",
          warrantyMonths: 12,
          isActive: true,
          isFeatured: false,
        },
      });

      const updatedData = {
        ...validProductInput,
        name: "Updated Battery Name",
        price: 16000,
      };

      const result = await updateProduct(prod.id, updatedData);
      expect(result.success).toBe(true);

      const store = getMockStore();
      const updated = store.products.find((p) => p.id === prod.id);
      expect(updated?.name).toBe("Updated Battery Name");
      expect(updated?.price).toBe(16000);
    });
  });

  describe("deleteProduct Action", () => {
    it("fails with Unauthorized if user is not ADMIN", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "cust_1", role: "CUSTOMER" } });
      const result = await deleteProduct("prod_1");
      expect(result.success).toBe(false);
    });

    it("successfully removes product from DB", async () => {
      mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

      const prod = await mockPrisma.product.create({
        data: {
          id: "prod_to_delete",
          name: "Deletable Product",
          slug: "deletable-product",
          description: "This product will be deleted.",
          sku: "DEL-1",
          price: 5000,
          dealerPrice: 4000,
          taxRate: 18,
          stock: 5,
          categoryId: "cat_1",
          warrantyMonths: 6,
          isActive: true,
          isFeatured: false,
        },
      });

      const result = await deleteProduct(prod.id);
      expect(result.success).toBe(true);

      const store = getMockStore();
      const found = store.products.find((p) => p.id === prod.id);
      expect(found).toBeUndefined();
    });
  });
});
