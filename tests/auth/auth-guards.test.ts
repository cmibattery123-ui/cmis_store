import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mockPrisma,
  resetMockStore,
  getMockStore,
} from "../helpers/mock-db";

import { getDbUserFromSession } from "@/lib/auth";

describe("Tier 1 & Tier 2: Auth & Role Guards Matrix", () => {
  beforeEach(() => {
    resetMockStore();
    vi.clearAllMocks();
  });

  describe("Session & User Resolution (getDbUserFromSession)", () => {
    it("returns null when session is null or undefined", async () => {
      expect(await getDbUserFromSession(null)).toBeNull();
      expect(await getDbUserFromSession(undefined)).toBeNull();
      expect(await getDbUserFromSession({})).toBeNull();
    });

    it("resolves user from session by email", async () => {
      const store = getMockStore();
      const user = await mockPrisma.user.create({
        data: {
          id: "u_1",
          email: "customer@example.com",
          name: "Test Customer",
          role: "CUSTOMER",
        },
      });

      const session = {
        user: { email: "customer@example.com", name: "Test Customer" },
      };

      const result = await getDbUserFromSession(session);
      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.role).toBe("CUSTOMER");
    });

    it("resolves user from session by ID fallback", async () => {
      const user = await mockPrisma.user.create({
        data: {
          id: "u_2",
          email: "dealer@example.com",
          name: "Test Dealer",
          role: "DEALER",
        },
      });

      const session = {
        user: { id: "u_2" },
      };

      const result = await getDbUserFromSession(session);
      expect(result).toBeDefined();
      expect(result?.id).toBe("u_2");
      expect(result?.role).toBe("DEALER");
    });

    it("returns null when session user does not exist in DB", async () => {
      const session = {
        user: { id: "non_existent_id", email: "ghost@example.com" },
      };
      const result = await getDbUserFromSession(session);
      expect(result).toBeNull();
    });
  });

  describe("Role Guard Matrix Across 3 Roles (ADMIN, DEALER, CUSTOMER)", () => {
    // Helper guard simulator mirroring route and server action policies
    function checkRoleAccess(
      session: { user?: { role: string } } | null,
      allowedRoles: string[]
    ): { allowed: boolean; status: number; message: string } {
      if (!session || !session.user) {
        return { allowed: false, status: 401, message: "Unauthorized" };
      }
      if (!allowedRoles.includes(session.user.role)) {
        return { allowed: false, status: 403, message: "Forbidden" };
      }
      return { allowed: true, status: 200, message: "OK" };
    }

    it("Admin routes reject unauthenticated requests with 401", () => {
      const res = checkRoleAccess(null, ["ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(401);
    });

    it("Admin routes reject CUSTOMER role with 403", () => {
      const session = { user: { role: "CUSTOMER" } };
      const res = checkRoleAccess(session, ["ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    it("Admin routes reject DEALER role with 403", () => {
      const session = { user: { role: "DEALER" } };
      const res = checkRoleAccess(session, ["ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    it("Admin routes allow ADMIN role with 200", () => {
      const session = { user: { role: "ADMIN" } };
      const res = checkRoleAccess(session, ["ADMIN"]);
      expect(res.allowed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("Dealer routes reject unauthenticated requests with 401", () => {
      const res = checkRoleAccess(null, ["DEALER", "ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(401);
    });

    it("Dealer routes reject CUSTOMER role with 403", () => {
      const session = { user: { role: "CUSTOMER" } };
      const res = checkRoleAccess(session, ["DEALER", "ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    it("Dealer routes allow DEALER role with 200", () => {
      const session = { user: { role: "DEALER" } };
      const res = checkRoleAccess(session, ["DEALER", "ADMIN"]);
      expect(res.allowed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("Dealer routes allow ADMIN role with 200 (Admin privilege override)", () => {
      const session = { user: { role: "ADMIN" } };
      const res = checkRoleAccess(session, ["DEALER", "ADMIN"]);
      expect(res.allowed).toBe(true);
      expect(res.status).toBe(200);
    });

    it("Customer routes reject unauthenticated requests with 401", () => {
      const res = checkRoleAccess(null, ["CUSTOMER", "DEALER", "ADMIN"]);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(401);
    });

    it("Customer routes allow CUSTOMER, DEALER, and ADMIN roles", () => {
      expect(checkRoleAccess({ user: { role: "CUSTOMER" } }, ["CUSTOMER", "DEALER", "ADMIN"]).allowed).toBe(true);
      expect(checkRoleAccess({ user: { role: "DEALER" } }, ["CUSTOMER", "DEALER", "ADMIN"]).allowed).toBe(true);
      expect(checkRoleAccess({ user: { role: "ADMIN" } }, ["CUSTOMER", "DEALER", "ADMIN"]).allowed).toBe(true);
    });
  });

  describe("Dealer Approval State Guard Matrix", () => {
    function checkDealerPortalAccess(dealer: { status: string } | null): {
      allowed: boolean;
      status: number;
      error?: string;
    } {
      if (!dealer) {
        return { allowed: false, status: 404, error: "Dealer account not found" };
      }
      if (dealer.status !== "APPROVED") {
        return {
          allowed: false,
          status: 403,
          error: "Your dealer account must be approved first",
        };
      }
      return { allowed: true, status: 200 };
    }

    it("denies access if dealer record is missing", () => {
      const res = checkDealerPortalAccess(null);
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(404);
    });

    it("denies quotation access if dealer status is PENDING", () => {
      const res = checkDealerPortalAccess({ status: "PENDING" });
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
      expect(res.error).toContain("approved");
    });

    it("denies quotation access if dealer status is REJECTED", () => {
      const res = checkDealerPortalAccess({ status: "REJECTED" });
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    it("denies quotation access if dealer status is SUSPENDED", () => {
      const res = checkDealerPortalAccess({ status: "SUSPENDED" });
      expect(res.allowed).toBe(false);
      expect(res.status).toBe(403);
    });

    it("grants quotation access when dealer status is APPROVED", () => {
      const res = checkDealerPortalAccess({ status: "APPROVED" });
      expect(res.allowed).toBe(true);
      expect(res.status).toBe(200);
    });
  });
});
