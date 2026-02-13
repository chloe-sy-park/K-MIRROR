/**
 * SessionStorage-based analysis result cache.
 * Prevents re-analyzing identical image inputs within the same session.
 *
 * - Max 5 entries (LRU eviction)
 * - 30 minute TTL per entry
 * - Keys are derived from a hash of the image base64 strings
 */

const CACHE_KEY = 'k-mirror-analysis-cache';
const MAX_ENTRIES = 5;
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheStore<T> {
  entries: Record<string, CacheEntry<T>>;
  order: string[]; // LRU order — most recent at end
}

function readStore<T>(): CacheStore<T> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return { entries: {}, order: [] };
    return JSON.parse(raw) as CacheStore<T>;
  } catch {
    return { entries: {}, order: [] };
  }
}

function writeStore<T>(store: CacheStore<T>): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — silently skip
  }
}

/**
 * Simple string hash for cache key generation.
 * Uses djb2 on a truncated portion of the input for speed.
 */
export function hashInputs(userImage: string, celebImage: string): string {
  const combined = userImage.slice(0, 200) + '|' + celebImage.slice(0, 200);
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash + combined.charCodeAt(i)) | 0;
  }
  return 'c_' + (hash >>> 0).toString(36);
}

/**
 * Retrieve a cached analysis result if available and not expired.
 */
export function getCachedResult<T>(key: string): T | null {
  const store = readStore<T>();
  const entry = store.entries[key];
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL_MS) {
    // Expired — remove
    delete store.entries[key];
    store.order = store.order.filter((k) => k !== key);
    writeStore(store);
    return null;
  }

  // Move to end of LRU order
  store.order = store.order.filter((k) => k !== key);
  store.order.push(key);
  writeStore(store);

  return entry.data;
}

/**
 * Store an analysis result in the cache.
 */
export function setCachedResult<T>(key: string, data: T): void {
  const store = readStore<T>();

  // Evict oldest entries if at capacity
  while (store.order.length >= MAX_ENTRIES) {
    const evictKey = store.order.shift();
    if (evictKey) delete store.entries[evictKey];
  }

  store.entries[key] = { data, timestamp: Date.now() };
  store.order = store.order.filter((k) => k !== key);
  store.order.push(key);

  writeStore(store);
}

/**
 * Clear all cached analysis results.
 */
export function clearCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore
  }
}
