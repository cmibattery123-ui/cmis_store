/**
 * Vitest global setup for integration tests.
 *
 * This file runs before every test file.
 * Add any global setup here (env checks, DB seed, etc.)
 */

// Ensure tests point to the local dev server
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

// Warn if dev server is not reachable
beforeAll(async () => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`);
    if (!res.ok && res.status !== 401) {
      console.warn(`[Integration Tests] Server responded with status ${res.status}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `\n⚠️ Notice: Dev server is not running at ${process.env.NEXTAUTH_URL} (${msg}). Live HTTP tests may fail.`
    );
  }
}, 10_000);
