// lib/news/cache.js

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Simple in-memory key→{ data, expiresAt } cache.
 * Works across requests in the same Node.js process (Next.js server).
 */
const store = new Map();

export const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set(key, data) {
    store.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  },

  has(key) {
    return this.get(key) !== null;
  },
};