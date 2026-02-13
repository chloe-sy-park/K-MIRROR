import { hashInputs, getCachedResult, setCachedResult, clearCache } from './cacheService';

const CACHE_KEY = 'k-mirror-analysis-cache';

describe('cacheService', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('hashInputs', () => {
    it('returns a deterministic hash string', () => {
      const a = hashInputs('imageA', 'imageB');
      const b = hashInputs('imageA', 'imageB');
      expect(a).toBe(b);
    });

    it('returns different hashes for different inputs', () => {
      const a = hashInputs('imageA', 'imageB');
      const b = hashInputs('imageC', 'imageD');
      expect(a).not.toBe(b);
    });

    it('prefixes hash with c_', () => {
      const hash = hashInputs('x', 'y');
      expect(hash).toMatch(/^c_/);
    });
  });

  describe('getCachedResult / setCachedResult', () => {
    it('returns null for missing key', () => {
      expect(getCachedResult('nonexistent')).toBeNull();
    });

    it('stores and retrieves a value', () => {
      setCachedResult('key1', { foo: 'bar' });
      expect(getCachedResult('key1')).toEqual({ foo: 'bar' });
    });

    it('returns null for expired entries', () => {
      setCachedResult('key1', { foo: 'bar' });

      // Fast-forward time past TTL (30 min + 1 ms)
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + 30 * 60 * 1000 + 1);

      expect(getCachedResult('key1')).toBeNull();
      vi.useRealTimers();
    });

    it('evicts oldest entry when at capacity (5)', () => {
      for (let i = 0; i < 5; i++) {
        setCachedResult(`k${i}`, i);
      }

      // Adding a 6th should evict k0 (the oldest)
      setCachedResult('k5', 5);
      expect(getCachedResult('k0')).toBeNull();
      expect(getCachedResult('k5')).toBe(5);
    });

    it('moves accessed entry to end of LRU order', () => {
      setCachedResult('a', 1);
      setCachedResult('b', 2);
      setCachedResult('c', 3);

      // Access 'a' to make it recently used
      getCachedResult('a');

      // Fill up to capacity + 1
      setCachedResult('d', 4);
      setCachedResult('e', 5);
      setCachedResult('f', 6); // should evict 'b' (oldest after 'a' was refreshed)

      expect(getCachedResult('a')).toBe(1); // still present
      expect(getCachedResult('b')).toBeNull(); // evicted
    });
  });

  describe('clearCache', () => {
    it('removes all cached entries', () => {
      setCachedResult('key1', 'value1');
      setCachedResult('key2', 'value2');

      clearCache();

      expect(getCachedResult('key1')).toBeNull();
      expect(getCachedResult('key2')).toBeNull();
    });

    it('does not throw when storage is empty', () => {
      expect(() => clearCache()).not.toThrow();
    });
  });

  describe('resilience', () => {
    it('handles corrupted sessionStorage gracefully', () => {
      sessionStorage.setItem(CACHE_KEY, 'not-json');
      expect(getCachedResult('any')).toBeNull();
    });
  });
});
