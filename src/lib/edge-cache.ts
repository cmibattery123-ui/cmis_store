/**
 * Cloudflare Edge Cache & Revalidation Layer
 * Source of Truth: Supabase PostgreSQL
 * Cache Layer: Cloudflare Edge Memory & Hyperdrive
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

const memoryStore = new Map<string, CacheEntry<any>>();
const MAX_ENTRIES = 1000;

/**
 * Retrieves data from the Cloudflare Edge cache if valid.
 */
export function getEdgeCache<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Stores data into the Cloudflare Edge cache with a specified TTL (in seconds) and invalidation tags.
 */
export function setEdgeCache<T>(
  key: string,
  data: T,
  ttlSeconds = 60,
  tags: string[] = []
): void {
  if (memoryStore.size >= MAX_ENTRIES) {
    // Evict oldest entries
    const firstKey = memoryStore.keys().next().value;
    if (firstKey) memoryStore.delete(firstKey);
  }

  memoryStore.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    tags,
  });
}

/**
 * Invalidates all cached entries matching the provided tags or prefixes.
 * Call this upon any database writes/mutations in Supabase.
 */
export function invalidateEdgeCache(...tagsOrPrefixes: string[]): void {
  if (tagsOrPrefixes.length === 0) {
    memoryStore.clear();
    return;
  }

  for (const [key, entry] of memoryStore.entries()) {
    const shouldDelete = tagsOrPrefixes.some(
      (target) =>
        entry.tags.includes(target) ||
        key.startsWith(target) ||
        key.includes(target)
    );

    if (shouldDelete) {
      memoryStore.delete(key);
    }
  }
}

/**
 * High-performance edge wrapper: Reads from Edge Cache or fetches from Supabase Source-of-Truth.
 */
export async function withEdgeCache<T>(
  key: string,
  ttlSeconds: number,
  tags: string[],
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = getEdgeCache<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) {
    setEdgeCache(key, fresh, ttlSeconds, tags);
  }
  return fresh;
}
