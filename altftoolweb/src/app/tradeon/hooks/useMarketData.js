// src/app/tradeon/hooks/useMarketData.js
"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getMarketEngine } from "../lib/marketData.js";

const EMPTY = { data: [], status: "connecting" };

/**
 * Subscribe to the live market engine via useSyncExternalStore — the idiomatic,
 * mount-safe way to read an external mutable store. Returns { data, status }.
 * The engine caches a referentially-stable store object so getSnapshot is cheap
 * and never triggers render loops.
 */
export function useMarketData() {
  const subscribe = useCallback((cb) => {
    if (typeof window === "undefined") return () => {};
    return getMarketEngine().subscribe(cb);
  }, []);

  const getSnapshot = useCallback(
    () => (typeof window === "undefined" ? EMPTY : getMarketEngine().getStore()),
    []
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Convenience: a single instrument snapshot by symbol. */
export function useInstrument(symbol) {
  const { data, status } = useMarketData();
  return { instrument: data.find((d) => d.symbol === symbol) || null, status };
}
