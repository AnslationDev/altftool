"use client";

import { useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getMediaQueryList() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

export function getReducedMotionSnapshot() {
  return getMediaQueryList()?.matches ?? true;
}

export function getReducedMotionServerSnapshot() {
  return true;
}

export function subscribeToReducedMotion(onStoreChange) {
  const mediaQuery = getMediaQueryList();
  if (!mediaQuery) return () => {};

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }

  mediaQuery.addListener(onStoreChange);
  return () => mediaQuery.removeListener(onStoreChange);
}

export default function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}
