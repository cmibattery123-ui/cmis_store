import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @/lib/auth
const mockDbUser = {
  id: "test-user-id",
  email: "current@example.com",
  role: "CUSTOMER",
  name: "Current User",
  phone: "9876543210",
  pin: null as string | null,
};

let currentMockUser = { ...mockDbUser };

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: currentMockUser.id, email: currentMockUser.email, role: currentMockUser.role },
  })),
  getDbUserFromSession: vi.fn(async () => currentMockUser),
}));

// Mock @/lib/db
const mockExistingOtherUser = {
  id: "other-user-id",
  email: "taken@example.com",
  name: "Other User",
};

const mockDbUpdate = vi.fn(async ({ where, data }: any) => {
  if (data.email) currentMockUser.email = data.email;
  if (data.name) currentMockUser.name = data.name;
  if (data.pin !== undefined) currentMockUser.pin = data.pin;
  return { ...currentMockUser, ...data };
});

const mockDbFindUnique = vi.fn(async ({ where }: any) => {
  if (where.id === currentMockUser.id || where.email === currentMockUser.email) {
    return currentMockUser;
  }
  if (where.email === mockExistingOtherUser.email || where.id === mockExistingOtherUser.id) {
    return mockExistingOtherUser;
  }
  return null;
});

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (args: any) => mockDbFindUnique(args),
      update: (args: any) => mockDbUpdate(args),
    },
    dealer: {
      findUnique: vi.fn(async () => ({
        id: "dealer-1",
        userId: currentMockUser.id,
        businessName: "Test Batteries",
        user: currentMockUser,
      })),
      update: vi.fn(async ({ data }: any) => ({
        id: "dealer-1",
        userId: currentMockUser.id,
        businessName: "Test Batteries",
        ...data,
      })),
    },
  },
}));

describe("API /api/user/pin", () => {
  beforeEach(() => {
    currentMockUser = { ...mockDbUser, pin: null };
    vi.clearAllMocks();
  });

  it("GET returns current PIN status for customer", async () => {
    const { GET } = await import("@/app/api/user/pin/route");
    const req = new Request("http://localhost/api/user/pin");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.hasCustomPin).toBe(false);
    expect(json.data.currentPin).toBe("");
  });

  it("POST updates PIN when valid 4-8 digits provided", async () => {
    const { POST } = await import("@/app/api/user/pin/route");
    const req = new Request("http://localhost/api/user/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "4321" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.pin).toBe("4321");
    expect(mockDbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-user-id" },
        data: { pin: "4321" },
      })
    );
  });

  it("POST rejects PIN if less than 4 or more than 8 digits", async () => {
    const { POST } = await import("@/app/api/user/pin/route");
    const reqShort = new Request("http://localhost/api/user/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "12" }),
    });
    const resShort = await POST(reqShort);
    expect(resShort.status).toBe(400);

    const reqLong = new Request("http://localhost/api/user/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: "123456789" }),
    });
    const resLong = await POST(reqLong);
    expect(resLong.status).toBe(400);
  });
});

describe("API /api/customer/profile email update", () => {
  beforeEach(() => {
    currentMockUser = { ...mockDbUser };
    vi.clearAllMocks();
  });

  it("PATCH rejects taken email address", async () => {
    const { PATCH } = await import("@/app/api/customer/profile/route");
    const req = new Request("http://localhost/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Name",
        email: "taken@example.com",
      }),
    });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/already in use/i);
  });

  it("PATCH successfully updates email when unique", async () => {
    const { PATCH } = await import("@/app/api/customer/profile/route");
    const req = new Request("http://localhost/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Name",
        email: "brandnew@example.com",
      }),
    });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.email).toBe("brandnew@example.com");
  });
});

describe("API /api/dealer/profile email update", () => {
  beforeEach(() => {
    currentMockUser = { ...mockDbUser, role: "DEALER" };
    vi.clearAllMocks();
  });

  it("PATCH rejects taken email address for dealer", async () => {
    const { PATCH } = await import("@/app/api/dealer/profile/route");
    const req = new Request("http://localhost/api/dealer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dealer Name",
        email: "taken@example.com",
      }),
    });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/already in use/i);
  });

  it("PATCH updates email for dealer when unique", async () => {
    const { PATCH } = await import("@/app/api/dealer/profile/route");
    const req = new Request("http://localhost/api/dealer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dealer Name",
        email: "newdealer@example.com",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-user-id" },
        data: expect.objectContaining({ email: "newdealer@example.com" }),
      })
    );
  });
});

describe("API /api/admin/profile email update", () => {
  beforeEach(() => {
    currentMockUser = { ...mockDbUser, role: "ADMIN" };
    vi.clearAllMocks();
  });

  it("PATCH rejects taken email address for admin", async () => {
    const { PATCH } = await import("@/app/api/admin/profile/route");
    const req = new Request("http://localhost/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin Name",
        email: "taken@example.com",
      }),
    });
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/already in use/i);
  });

  it("PATCH updates email for admin when unique", async () => {
    const { PATCH } = await import("@/app/api/admin/profile/route");
    const req = new Request("http://localhost/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin Name",
        email: "newadmin@example.com",
      }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(mockDbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-user-id" },
        data: expect.objectContaining({ email: "newadmin@example.com" }),
      })
    );
  });
});
