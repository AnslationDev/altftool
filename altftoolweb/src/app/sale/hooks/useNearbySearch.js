"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 500;
// Module-level so the cache survives across component remounts within the
// same page session (mirrors the pattern used by src/lib/sale/cache.js).
const searchCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function buildKey({ latitude, longitude, radius, keyword }) {
  return [latitude?.toFixed?.(3), longitude?.toFixed?.(3), radius || "default", keyword.trim().toLowerCase()].join("|");
}

/**
 * Debounced, cached client-side hook for the Nearby Sale Search feature.
 * Calls GET /api/search/nearby — never generates results locally.
 *
 * @returns {{
 *   results: Array<object>,
 *   loading: boolean,
 *   error: string | null,
 *   search: (params: { latitude: number, longitude: number, radius?: number, keyword: string }) => void,
 *   reset: () => void,
 * }}
 */
export function useNearbySearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  const runSearch = useCallback(async ({ latitude, longitude, radius, keyword }) => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Location is required to search nearby.");
      return;
    }
    if (!keyword || !keyword.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const cacheKey = buildKey({ latitude, longitude, radius, keyword });
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setResults(cached.data);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++latestRequestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        keyword,
      });
      if (radius) params.set("radius", String(radius));

      const response = await fetch(`/api/search/nearby?${params.toString()}`, {
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      if (requestId !== latestRequestIdRef.current) return; // superseded by a newer search

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Couldn't load nearby results. Please try again.");
      }

      const data = Array.isArray(payload) ? payload : [];
      searchCache.set(cacheKey, { data, timestamp: Date.now() });
      setResults(data);
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (requestId !== latestRequestIdRef.current) return;
      setError(err?.message || "Something went wrong while searching nearby. Check your connection and try again.");
      setResults([]);
    } finally {
      if (requestId === latestRequestIdRef.current) setLoading(false);
    }
  }, []);

  const search = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(params), DEBOUNCE_MS);
    },
    [runSearch],
  );

  const reset = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return { results, loading, error, search, reset };
}
