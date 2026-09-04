import { vi } from "vitest";
import { mockPrisma } from "./helpers/mock-db";

vi.mock("@/lib/db", () => ({
  db: mockPrisma,
  withDbRetry: vi.fn(async (fn: () => any) => fn()),
}));
