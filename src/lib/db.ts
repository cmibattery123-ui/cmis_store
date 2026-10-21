import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

let currentPrisma: PrismaClient | null = null;
let currentPool: Pool | null = null;
let currentSqlite: InstanceType<typeof Database> | null = null;
let lastUsedConnString: string | null = null;

export function resetDb() {
  if (currentPool) {
    try {
      currentPool.end().catch(() => {});
    } catch {}
    currentPool = null;
  }
  if (currentSqlite) {
    try {
      currentSqlite.close();
    } catch {}
    currentSqlite = null;
  }
  currentPrisma = null;
  lastUsedConnString = null;
}

export function getDb(): PrismaClient {
  const rawConnectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "file:./data/cmis.db";

  // Strip sslmode from the URL to let node-postgres use the explicit ssl options object
  const cleanConnectionString = rawConnectionString
    .replace(/[?&]sslmode=[^&]+/g, "")
    .replace(/\?&/g, "?")
    .replace(/\?$/, "")
    .trim();

  if (currentPrisma && lastUsedConnString === cleanConnectionString) {
    return currentPrisma;
  }

  resetDb();

  // SQLite Support for embedded EC2 disk persistence ($0 RDS cost)
  if (cleanConnectionString.startsWith("file:") || cleanConnectionString.endsWith(".db")) {
    const rawPath = cleanConnectionString.replace(/^file:/, "");
    const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Auto-seed: If the target database does not exist yet (e.g. newly mounted empty volume), copy the bundled template
    if (!fs.existsSync(dbPath)) {
      const candidates = [
        path.resolve(process.cwd(), "data-template", "cmis.db"),
        path.resolve(process.cwd(), "prisma", "seed.db"),
        path.resolve(process.cwd(), "data", "cmis.db"),
        path.resolve(process.cwd(), "prisma", "cmis.db"),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && cand !== dbPath) {
          try {
            fs.copyFileSync(cand, dbPath);
            console.log(`[SQLite] Seeded fresh database at ${dbPath} from ${cand}`);
            break;
          } catch (err) {
            console.warn(`[SQLite] Could not copy seed template from ${cand}:`, err);
          }
        }
      }
    }

    const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
    currentPrisma = new PrismaClient({
      adapter,
      log: ["error"],
    });
    lastUsedConnString = cleanConnectionString;
    return currentPrisma;
  }

  let hostname: string | undefined;
  try {
    const parsed = new URL(cleanConnectionString.replace("postgresql://", "http://").replace("postgres://", "http://"));
    hostname = parsed.hostname || undefined;
  } catch {}

  const isLocalOrNoSsl =
    process.env.IS_HYPERDRIVE === "true" ||
    process.env.DATABASE_SSL === "false" ||
    cleanConnectionString.includes("cloudflare") ||
    cleanConnectionString.includes("hyperdrive") ||
    cleanConnectionString.includes("127.0.0.1") ||
    cleanConnectionString.includes("localhost") ||
    cleanConnectionString.includes("sslmode=disable") ||
    hostname === "db" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  const pool = new Pool({
    connectionString: cleanConnectionString,
    max: process.env.NODE_ENV === "production" ? 4 : 2,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    ...(isLocalOrNoSsl
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
