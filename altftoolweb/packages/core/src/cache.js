export function createTtlCache({ ttlMs = 60000, maxEntries = 100 } = {}) {
  const entries = new Map();

  function normalizedMaxEntries() {
    const value = Number(maxEntries);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }

  function touchEntry(key, entry) {
    entries.delete(key);
    entries.set(key, entry);
    return entry.value;
  }

  function readEntry(key) {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      if (!entry.staleUntil || entry.staleUntil <= Date.now()) {
        entries.delete(key);
      }
      return undefined;
    }

    return touchEntry(key, entry);
  }

  function readStaleEntry(key) {
    const entry = entries.get(key);
    if (!entry || !entry.staleUntil || entry.staleUntil <= Date.now()) return undefined;
    return touchEntry(key, entry);
  }

  function setEntry(key, value, ttl = ttlMs, options = {}) {
    const safeTtl = Math.max(0, Number(ttl) || ttlMs);
    const safeStaleTtl = Math.max(0, Number(options.staleTtlMs) || 0);
    entries.set(key, {
      value,
      expiresAt: Date.now() + safeTtl,
      staleUntil: safeStaleTtl > 0 ? Date.now() + safeTtl + safeStaleTtl : Date.now() + safeTtl,
    });

    while (entries.size > normalizedMaxEntries()) {
      entries.delete(entries.keys().next().value);
    }

    return value;
  }

  async function getOrSet(key, loader, ttl = ttlMs, options = {}) {
    const cached = readEntry(key);
    if (cached !== undefined) return cached;

    const staleEntry = options.returnStaleOnError ? entries.get(key) : null;
    const staleValue = options.returnStaleOnError ? readStaleEntry(key) : undefined;
    const pending = Promise.resolve().then(loader);
    setEntry(key, pending, ttl);

    try {
      const value = await pending;
      setEntry(key, value, ttl, options);
      return value;
    } catch (error) {
      entries.delete(key);
      if (staleValue !== undefined && !staleValue?.then) {
        if (staleEntry) {
          entries.set(key, {
            ...staleEntry,
            value: staleValue,
            expiresAt: Math.min(staleEntry.expiresAt, Date.now() - 1),
          });
        }
        return staleValue;
      }
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
    stats({ includeKeys = false } = {}) {
      const now = Date.now();
      const values = [...entries.entries()];

      return {
        size: entries.size,
        maxEntries: normalizedMaxEntries(),
        freshEntries: values.filter(([, entry]) => entry.expiresAt > now).length,
        staleEntries: values.filter(
          ([, entry]) => entry.expiresAt <= now && entry.staleUntil > now,
        ).length,
        ...(includeKeys ? { keys: values.map(([key]) => key) } : {}),
      };
    },
  };
}

export function createSharedSubscriptionRegistry({ keepAliveMs = 30000, maxEntries = Infinity } = {}) {
  const subscriptions = new Map();
  const normalizedMaxEntries =
    Number.isFinite(Number(maxEntries)) && Number(maxEntries) > 0
      ? Math.floor(Number(maxEntries))
      : Infinity;

  function closeEntry(key, entry) {
    if (entry.cleanupTimer) clearTimeout(entry.cleanupTimer);
    try {
      entry.unsubscribe?.();
    } finally {
      subscriptions.delete(key);
    }
  }

  function pruneIdleEntries() {
    if (!Number.isFinite(normalizedMaxEntries) || subscriptions.size <= normalizedMaxEntries) return;

    const idleEntries = [...subscriptions.entries()]
      .filter(([, entry]) => entry.listeners.size === 0)
      .sort((a, b) => (a[1].lastUsedAt || 0) - (b[1].lastUsedAt || 0));

    for (const [key, entry] of idleEntries) {
      if (subscriptions.size <= normalizedMaxEntries) return;
      closeEntry(key, entry);
    }
  }

  return {
    subscribe(key, start, callback, onError) {
      let entry = subscriptions.get(key);
      const now = Date.now();

      if (!entry) {
        entry = {
          cleanupTimer: null,
          createdAt: now,
          errorListeners: new Set(),
          hasValue: false,
          lastUsedAt: now,
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

      entry.lastUsedAt = Date.now();
      entry.listeners.add(callback);
      if (onError) entry.errorListeners.add(onError);
      pruneIdleEntries();

      if (entry.hasValue) {
        queueMicrotask(() => {
          if (entry.listeners.has(callback)) callback?.(entry.value);
        });
      }

      return () => {
        entry.listeners.delete(callback);
        if (onError) entry.errorListeners.delete(onError);

        if (entry.listeners.size > 0 || entry.cleanupTimer) return;
        entry.lastUsedAt = Date.now();

        entry.cleanupTimer = setTimeout(() => {
          if (entry.listeners.size === 0) {
            closeEntry(key, entry);
          }
        }, keepAliveMs);
        entry.cleanupTimer.unref?.();
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
    stats({ includeKeys = false } = {}) {
      const entries = [...subscriptions.entries()];

      return {
        size: subscriptions.size,
        maxEntries: Number.isFinite(normalizedMaxEntries) ? normalizedMaxEntries : null,
        keepAliveMs,
        activeListeners: entries.reduce((sum, [, entry]) => sum + entry.listeners.size, 0),
        errorListeners: entries.reduce((sum, [, entry]) => sum + entry.errorListeners.size, 0),
        pendingCleanup: entries.filter(([, entry]) => Boolean(entry.cleanupTimer)).length,
        ...(includeKeys
          ? {
              entries: entries.map(([key, entry]) => ({
                key,
                listeners: entry.listeners.size,
                errorListeners: entry.errorListeners.size,
                hasValue: entry.hasValue,
                pendingCleanup: Boolean(entry.cleanupTimer),
              })),
            }
          : {}),
      };
    },
  };
}
