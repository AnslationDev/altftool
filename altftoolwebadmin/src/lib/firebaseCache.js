"use client";

import { createSharedSubscriptionRegistry, createTtlCache } from "@altftool/core/cache";

const readCache = createTtlCache({ ttlMs: 30000, maxEntries: 80 });
const subscriptions = createSharedSubscriptionRegistry({ keepAliveMs: 15000, maxEntries: 36 });
const STALE_READ_MS = Number(process.env.NEXT_PUBLIC_ALTFT_ADMIN_FIREBASE_STALE_READ_MS || 2 * 60 * 1000);

export function subscribeCached(key, start, callback, onError) {
  return subscriptions.subscribe(key, start, callback, onError);
}

export function getCachedFirebaseRead(key, loader, ttlMs = 30000, options = {}) {
  return readCache.getOrSet(key, loader, ttlMs, {
    returnStaleOnError: true,
    staleTtlMs: STALE_READ_MS,
    ...options,
  });
}

export function clearFirebaseCache(key) {
  if (key) {
    readCache.delete(key);
    subscriptions.clear(key);
    return;
  }

  readCache.clear();
  subscriptions.clear();
}
