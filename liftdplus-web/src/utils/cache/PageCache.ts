/**
 * Simple in-memory cache for page-level data with TTL support
 * Designed for PWA to avoid loading spinners when navigating back to cached pages
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

class PageCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get cached data if it exists and hasn't expired
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache HIT for key: ${key}`);
    return entry.data;
  }

  /**
   * Store data in cache with current timestamp
   * @param key - Cache key
   * @param data - Data to cache
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`Cache SET for key: ${key}`);
  }

  /**
   * Invalidate cache entries matching a pattern
   * @param pattern - String pattern to match against cache keys
   */
  invalidate(pattern: string): void {
    let invalidatedCount = 0;

    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }

    if (invalidatedCount > 0) {
      console.log(
        `Cache INVALIDATED ${invalidatedCount} entries matching: ${pattern}`
      );
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`Cache CLEARED all ${count} entries`);
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const pageCache = new PageCache();

// Export class for testing if needed
export { PageCache };
