"use client";

import { createSharedSubscriptionRegistry, createTtlCache } from "@altftool/core/cache";

const readCache = createTtlCache({ ttlMs: 60000, maxEntries: 120 });
const subscriptions = createSharedSubscriptionRegistry({ keepAliveMs: 30000, maxEntries: 48 });
const STALE_READ_MS = Number(process.env.NEXT_PUBLIC_ALTFT_FIREBASE_STALE_READ_MS || 5 * 60 * 1000);

export function snapshotDocs(snapshot, mapper = (doc) => ({ id: doc.id, ...doc.data() })) {
  return snapshot.docs.map(mapper);
}

export function subscribeCached(key, start, callback, onError) {
  return subscriptions.subscribe(key, start, callback, onError);
}

export function getCachedFirebaseRead(key, loader, ttlMs = 60000, options = {}) {
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

export function getFirebaseCacheStats() {
  return {
    reads: readCache.stats(),
    subscriptions: subscriptions.stats(),
  };
}
