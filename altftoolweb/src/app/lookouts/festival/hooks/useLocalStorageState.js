"use client";

import { useCallback, useEffect, useState } from "react";

/** SSR-safe localStorage-backed state. Reads lazily on mount to avoid hydration mismatches. */
export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {
      // Ignore malformed or inaccessible storage — fall back to initialValue.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable (private browsing) — silently skip persistence.
    }
  }, [key, value, hydrated]);

  const update = useCallback((next) => setValue(next), []);

  return [value, update];
}
