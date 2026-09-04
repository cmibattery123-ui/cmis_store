import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let currentPrisma: PrismaClient | null = null;
let currentPool: Pool | null = null;
let lastUsedConnString: string | null = null;

export function resetDb() {
  if (currentPool) {
    try {
      currentPool.end().catch(() => {});
    } catch {}
    currentPool = null;
  }
  currentPrisma = null;
  lastUsedConnString = null;
}

export function getDb(): PrismaClient {
  const rawConnectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!rawConnectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL environment variable is required but was not provided.");
  }

  // Strip sslmode from the URL to let node-postgres use the explicit ssl options object
  const cleanConnectionString = rawConnectionString
    .replace(/[?&]sslmode=[^&]+/g, "")
    .replace(/\?&/g, "?")
    .replace(/\?$/, "");

  if (currentPrisma && lastUsedConnString === cleanConnectionString) {
    return currentPrisma;
  }

  resetDb();

  let hostname: string | undefined;
  try {
    const parsed = new URL(cleanConnectionString.replace("postgresql://", "http://").replace("postgres://", "http://"));
    hostname = parsed.hostname || undefined;
  } catch {}

  const isHyperdrive =
    process.env.IS_HYPERDRIVE === "true" ||
    cleanConnectionString.includes("cloudflare") ||
    cleanConnectionString.includes("hyperdrive") ||
    cleanConnectionString.includes("127.0.0.1") ||
    cleanConnectionString.includes("localhost");

  const pool = new Pool({
    connectionString: cleanConnectionString,
    max: isHyperdrive ? 5 : 1,
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 10000,
    ...(isHyperdrive
      ? {}
      : {
          ssl: {
            rejectUnauthorized: false,
            ...(hostname ? { servername: hostname } : {}),
          },
        }),
  });

  pool.on("error", (err) => {
    console.warn("[PostgreSQL Pool Error, resetting client]", err?.message || err);
    resetDb();
  });

  const adapter = new PrismaPg(pool);

  currentPrisma = new PrismaClient({
    adapter,
    log: ["error"],
  });

  currentPool = pool;
  lastUsedConnString = cleanConnectionString;
  return currentPrisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === "function") {
      return (val as (...args: unknown[]) => unknown).bind(client);
    }
    return val;
  },
});

/**
 * Execute a database operation with automatic retry on stale socket termination or timeout
 */
export async function withDbRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isSocketOrTimeoutError =
        errorMessage.includes("Connection terminated") ||
        errorMessage.includes("timeout exceeded") ||
        errorMessage.includes("proxy request failed") ||
        errorMessage.includes("closed") ||
        errorMessage.includes("terminated");

      if (attempt <= maxRetries && isSocketOrTimeoutError) {
        console.warn(`[DB Retry] Connection issue (attempt ${attempt}/${maxRetries}): ${errorMessage}. Resetting DB client...`);
        resetDb();
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Database operation failed after retries");
}

export type DbTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
