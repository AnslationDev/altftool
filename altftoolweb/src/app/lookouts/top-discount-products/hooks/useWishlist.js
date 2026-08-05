"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tdp:wishlist";

function readStoredIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Client-only wishlist persisted to localStorage — no backend involved. */
export function useWishlist() {
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    setIds(new Set(readStoredIds()));
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // storage unavailable (private mode, quota) — wishlist just won't persist
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((id) => ids.has(id), [ids]);

  return { isSaved, toggle, count: ids.size };
}
