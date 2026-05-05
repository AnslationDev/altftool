export function createTtlCache({ ttlMs = 60000, maxEntries = 100 } = {}) {
  const entries = new Map();

  function readEntry(key) {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      entries.delete(key);
      return undefined;
    }

    entries.delete(key);
    entries.set(key, entry);
    return entry.value;
  }

  function setEntry(key, value, ttl = ttlMs) {
    const safeTtl = Math.max(0, Number(ttl) || ttlMs);
    entries.set(key, {
      value,
      expiresAt: Date.now() + safeTtl,
    });

    while (entries.size > maxEntries) {
      entries.delete(entries.keys().next().value);
    }

    return value;
  }

  async function getOrSet(key, loader, ttl = ttlMs) {
    const cached = readEntry(key);
    if (cached !== undefined) return cached;

    const pending = Promise.resolve().then(loader);
    setEntry(key, pending, ttl);

    try {
      const value = await pending;
      setEntry(key, value, ttl);
      return value;
    } catch (error) {
      entries.delete(key);
      throw error;
    }
  }

  return {
    get: readEntry,
    set: setEntry,
    getOrSet,
    delete: (key) => entries.delete(key),
    clear: () => entries.clear(),
    size: () => entries.size,
  };
}

export function createSharedSubscriptionRegistry({ keepAliveMs = 30000 } = {}) {
  const subscriptions = new Map();

  function closeEntry(key, entry) {
    if (entry.cleanupTimer) clearTimeout(entry.cleanupTimer);
    try {
      entry.unsubscribe?.();
    } finally {
      subscriptions.delete(key);
    }
  }

  return {
    subscribe(key, start, callback, onError) {
      let entry = subscriptions.get(key);

      if (!entry) {
        entry = {
          cleanupTimer: null,
          errorListeners: new Set(),
          hasValue: false,
          listeners: new Set(),
          unsubscribe: null,
          value: undefined,
        };

        subscriptions.set(key, entry);

        try {
          entry.unsubscribe = start(
            (value) => {
              entry.value = value;
              entry.hasValue = true;
              entry.listeners.forEach((listener) => listener?.(value));
            },
            (error) => {
              entry.errorListeners.forEach((listener) => listener?.(error));
            },
          );
        } catch (error) {
          subscriptions.delete(key);
          throw error;
        }
      }

      if (entry.cleanupTimer) {
        clearTimeout(entry.cleanupTimer);
        entry.cleanupTimer = null;
      }

      entry.listeners.add(callback);
      if (onError) entry.errorListeners.add(onError);

      if (entry.hasValue) {
        queueMicrotask(() => {
          if (entry.listeners.has(callback)) callback?.(entry.value);
        });
      }

      return () => {
        entry.listeners.delete(callback);
        if (onError) entry.errorListeners.delete(onError);

        if (entry.listeners.size > 0 || entry.cleanupTimer) return;

        entry.cleanupTimer = setTimeout(() => {
          if (entry.listeners.size === 0) {
            closeEntry(key, entry);
          }
        }, keepAliveMs);
      };
    },

    clear(key) {
      if (!key) {
        subscriptions.forEach((entry, entryKey) => closeEntry(entryKey, entry));
        return;
      }

      const entry = subscriptions.get(key);
      if (entry) closeEntry(key, entry);
    },

    size: () => subscriptions.size,
  };
}
