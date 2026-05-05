"use client";

import { createSharedSubscriptionRegistry, createTtlCache } from "@altftool/core/cache";

const readCache = createTtlCache({ ttlMs: 30000, maxEntries: 80 });
const subscriptions = createSharedSubscriptionRegistry({ keepAliveMs: 15000 });

export function snapshotDocs(snapshot, mapper = (doc) => ({ id: doc.id, ...doc.data() })) {
  return snapshot.docs.map(mapper);
}

export function subscribeCached(key, start, callback, onError) {
  return subscriptions.subscribe(key, start, callback, onError);
}

export function getCachedFirebaseRead(key, loader, ttlMs = 30000) {
  return readCache.getOrSet(key, loader, ttlMs);
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
