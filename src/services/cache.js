/**
 * Cache Utility Module
 * 
 * Provides in-memory caching with TTL (Time To Live) support
 * for reducing API calls and improving performance.
 */

class CacheStore {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    
    // Periodically clean expired entries
    setInterval(() => this.clearExpired(), 60 * 1000);
  }

  /**
   * Generate a cache key from multiple parts
   */
  generateKey(...parts) {
    return parts.map(p => {
      if (typeof p === 'object') {
        return JSON.stringify(p);
      }
      return String(p);
    }).join(':');
  }

  /**
   * Get a value from cache
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all entries matching a prefix
   */
  clearByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all expired entries
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// TTL constants (in milliseconds)
export const TTL = {
  TRANSLATION: 10 * 60 * 1000,  // 10 minutes - translations rarely change
  QUESTIONS: 30 * 1000,          // 30 seconds - allow near real-time
  TAGS: 5 * 60 * 1000,           // 5 minutes - tags change infrequently
  COMMUNITIES: 5 * 60 * 1000,    // 5 minutes
  PROFILE: 2 * 60 * 1000,        // 2 minutes
};

// Singleton cache instance
const cache = new CacheStore();

export default cache;
