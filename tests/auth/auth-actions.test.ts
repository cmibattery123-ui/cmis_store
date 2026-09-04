import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import {
  createMockPrismaClient,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

const { mockPrisma, mockSignIn, mockSignOut } = vi.hoisted(() => ({
  mockPrisma: createMockPrismaClient(),
  mockSignIn: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  withDbRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

vi.mock("@/lib/auth", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  auth: vi.fn(),
}));

import {
  loginAction,
  registerAction,
  dealerRegisterAction,
} from "@/actions/auth.actions";

describe("Tier 1 & Tier 2: Auth Actions & Validation", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  describe("Customer Registration (registerAction)", () => {
    it("successfully creates a new customer with hashed password", async () => {
      const payload = {
        name: "Aarav Sharma",
        email: "aarav@example.com",
        phone: "9876543210",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = await registerAction(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.message).toContain("successfully");
      }

      const store = getMockStore();
      const createdUser = store.users.find((u) => u.email === "aarav@example.com");
      expect(createdUser).toBeDefined();
      expect(createdUser?.role).toBe("CUSTOMER");
      expect(createdUser?.phone).toBe("9876543210");
      // Password must be hashed with bcrypt, never plaintext
      expect(createdUser?.password).not.toBe("Password123");
      const isMatch = await bcrypt.compare("Password123", createdUser!.password);
      expect(isMatch).toBe(true);
    });

    it("rejects registration when email already exists", async () => {
      await mockPrisma.user.create({
        data: {
          email: "existing@example.com",
          name: "Existing User",
          password: "hashedPassword",
          role: "CUSTOMER",
        },
      });

      const payload = {
        name: "Duplicate User",
        email: "existing@example.com",
        phone: "9876543210",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = await registerAction(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("already exists");
      }
    });

    it("fails validation when password and confirmPassword do not match", async () => {
      const payload = {
        name: "Test User",
        email: "mismatch@example.com",
        phone: "9876543210",
        password: "Password123",
        confirmPassword: "Password456",
      };

      const result = await registerAction(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Passwords do not match");
      }
    });

    it("fails validation when password lacks required complexity (no uppercase or no number)", async () => {
      const noUpper = {
        name: "Test User",
        email: "noupper@example.com",
        phone: "9876543210",
        password: "password123",
        confirmPassword: "password123",
      };
      const res1 = await registerAction(noUpper);
      expect(res1.success).toBe(false);

      const noNumber = {
        name: "Test User",
        email: "nonumber@example.com",
        phone: "9876543210",
        password: "PasswordXYZ",
        confirmPassword: "PasswordXYZ",
      };
      const res2 = await registerAction(noNumber);
      expect(res2.success).toBe(false);
    });

    it("fails validation for invalid Indian phone numbers", async () => {
      const invalidPhone = {
        name: "Test User",
        email: "badphone@example.com",
        phone: "1234567890", // Invalid prefix (doesn't start with 6-9)
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = await registerAction(invalidPhone);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid Indian phone number");
      }
    });
  });

  describe("Dealer Registration (dealerRegisterAction)", () => {
    const validDealerData = {
      name: "Rajesh Patel",
      email: "rajesh@patelenterprises.com",
      phone: "9823456789",
      password: "DealerPass123",
      businessName: "Patel Solar & Battery Enterprises",
      gstNumber: "27AAPFU0939F1ZV",
      panNumber: "AAPFU0939F",
      businessAddress: "101 Industrial Estate, Phase 2",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
    };

    it("successfully creates User and Dealer records with PENDING status", async () => {
      const result = await dealerRegisterAction(validDealerData);
      expect(result.success).toBe(true);

      const store = getMockStore();
      const user = store.users.find((u) => u.email === "rajesh@patelenterprises.com");
      expect(user).toBeDefined();
      expect(user?.role).toBe("DEALER");

      const dealer = store.dealers.find((d) => d.userId === user?.id);
      expect(dealer).toBeDefined();
      expect(dealer?.businessName).toBe(validDealerData.businessName);
      expect(dealer?.gstNumber).toBe(validDealerData.gstNumber);
      expect(dealer?.status).toBe("PENDING");
    });

    it("rejects dealer registration with duplicate GST number", async () => {
      await mockPrisma.dealer.create({
        data: {
          userId: "some_other_user",
          businessName: "Other Business",
          gstNumber: "27AAPFU0939F1ZV",
          phone: "9800000000",
          businessAddress: "Some Address",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
        },
      });

      const result = await dealerRegisterAction(validDealerData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("GST number already exists");
      }
    });

    it("rejects dealer registration with invalid GST or PAN format", async () => {
      const invalidGst = {
        ...validDealerData,
        email: "invalid-gst@example.com",
        gstNumber: "INVALID_GST_123",
      };

      const result = await dealerRegisterAction(invalidGst);
      expect(result.success).toBe(false);
    });

    it("rejects dealer registration with invalid pincode", async () => {
      const invalidPincode = {
        ...validDealerData,
        email: "bad-pin@example.com",
        pincode: "012345", // Invalid (cannot start with 0)
      };

      const result = await dealerRegisterAction(invalidPincode);
      expect(result.success).toBe(false);
    });
  });

  describe("User Login (loginAction)", () => {
    it("calls NextAuth signIn with validated credentials", async () => {
      mockSignIn.mockResolvedValueOnce({ ok: true });

      const result = await loginAction({
        email: "test@example.com",
        password: "Password123",
      });

      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "Password123",
        redirect: false,
      });
      expect(result.success).toBe(true);
    });

    it("returns error on invalid email format", async () => {
      const result = await loginAction({
        email: "not-an-email",
        password: "Password123",
      });

      expect(result.success).toBe(false);
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("returns error on short password", async () => {
      const result = await loginAction({
        email: "test@example.com",
        password: "123",
      });

      expect(result.success).toBe(false);
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });
});
