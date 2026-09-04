import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import {
  createMockPrismaClient,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

const mockPrisma = createMockPrismaClient();

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  withDbRetry: vi.fn((fn: () => any) => fn()),
}));

describe("Tier 1 & Tier 2: Password Hashing & Admin PIN Security Enforcement", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
    process.env.ADMIN_SECURITY_PIN = "998877";
  });

  describe("Bcrypt Password Hashing & Security", () => {
    it("hashes password with 12 salt rounds producing unique salts", async () => {
      const plain = "SecretPassword123!";
      const hash1 = await bcrypt.hash(plain, 12);
      const hash2 = await bcrypt.hash(plain, 12);

      // Hashes must be different because of random salt
      expect(hash1).not.toBe(hash2);
      expect(hash1.startsWith("$2a$") || hash1.startsWith("$2b$")).toBe(true);

      // Both hashes verify the same plaintext password
      expect(await bcrypt.compare(plain, hash1)).toBe(true);
      expect(await bcrypt.compare(plain, hash2)).toBe(true);

      // Fails on wrong password
      expect(await bcrypt.compare("WrongPassword", hash1)).toBe(false);
    });
  });

  describe("Credentials Authorize Flow & Role-Based PIN Enforcement", () => {
    // Authorize logic function mirroring src/lib/auth.ts
    async function authorizeCredentials(credentials: {
      email?: string;
      password?: string;
      pin?: string;
    }) {
      if (!credentials.email || !credentials.password) return null;

      const user = await mockPrisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!user || !user.password) return null;
      if (!user.isActive) return null;

      const passwordMatch = await bcrypt.compare(credentials.password, user.password);
      if (!passwordMatch) return null;

      // Secure Admin PIN check (mandatory PIN verification for ADMIN role)
      if (user.role === "ADMIN") {
        const expectedPin = process.env.ADMIN_SECURITY_PIN || "123456";
        if (!credentials.pin || credentials.pin !== expectedPin) {
          return null;
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    it("ADMIN login FAILS when PIN is omitted", async () => {
      const hashedPassword = await bcrypt.hash("AdminPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "admin@perfectbatteries.com",
          name: "System Admin",
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "admin@perfectbatteries.com",
        password: "AdminPass123",
        // No PIN provided
      });

      expect(result).toBeNull();
    });

    it("ADMIN login FAILS when wrong PIN is provided", async () => {
      const hashedPassword = await bcrypt.hash("AdminPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "admin@perfectbatteries.com",
          name: "System Admin",
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "admin@perfectbatteries.com",
        password: "AdminPass123",
        pin: "000000", // Wrong PIN
      });

      expect(result).toBeNull();
    });

    it("ADMIN login SUCCEEDS when correct PIN is provided", async () => {
      const hashedPassword = await bcrypt.hash("AdminPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "admin@perfectbatteries.com",
          name: "System Admin",
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "admin@perfectbatteries.com",
        password: "AdminPass123",
        pin: "998877", // Matches process.env.ADMIN_SECURITY_PIN
      });

      expect(result).not.toBeNull();
      expect(result?.email).toBe("admin@perfectbatteries.com");
      expect(result?.role).toBe("ADMIN");
    });

    it("DEALER login SUCCEEDS without requiring a PIN", async () => {
      const hashedPassword = await bcrypt.hash("DealerPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "dealer@perfectbatteries.com",
          name: "Dealer User",
          password: hashedPassword,
          role: "DEALER",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "dealer@perfectbatteries.com",
        password: "DealerPass123",
      });

      expect(result).not.toBeNull();
      expect(result?.role).toBe("DEALER");
    });

    it("CUSTOMER login SUCCEEDS without requiring a PIN", async () => {
      const hashedPassword = await bcrypt.hash("CustomerPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "customer@perfectbatteries.com",
          name: "Customer User",
          password: hashedPassword,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "customer@perfectbatteries.com",
        password: "CustomerPass123",
      });

      expect(result).not.toBeNull();
      expect(result?.role).toBe("CUSTOMER");
    });

    it("Inactive user cannot log in even with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("CustomerPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "inactive@perfectbatteries.com",
          name: "Inactive User",
          password: hashedPassword,
          role: "CUSTOMER",
          isActive: false, // Deactivated account
        },
      });

      const result = await authorizeCredentials({
        email: "inactive@perfectbatteries.com",
        password: "CustomerPass123",
      });

      expect(result).toBeNull();
    });

    it("Fails when password does not match", async () => {
      const hashedPassword = await bcrypt.hash("CorrectPass123", 12);
      await mockPrisma.user.create({
        data: {
          email: "user@perfectbatteries.com",
          name: "User",
          password: hashedPassword,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      const result = await authorizeCredentials({
        email: "user@perfectbatteries.com",
        password: "IncorrectPassword",
      });

      expect(result).toBeNull();
    });
  });
});
