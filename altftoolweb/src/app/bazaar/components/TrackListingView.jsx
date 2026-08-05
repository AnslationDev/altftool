"use client";

import { useEffect } from "react";

import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";

/**
 * Records that this ad was opened, so it can appear in the "Recently viewed"
 * rail on the next visit. Renders nothing.
 *
 * Two ordering rules matter here:
 *
 * 1. It waits for `useHydrated()`. Writing before hydration would push the id
 *    into the *empty* initial store and then `hydrate()` would replace it with
 *    whatever localStorage held, silently dropping this view.
 * 2. It is safe to run twice. React StrictMode mounts effects twice in dev, and
 *    `addRecentlyViewed` short-circuits when the id is already at the front of
 *    the list, so the second call is a no-op rather than a duplicate entry or a
 *    redundant localStorage write. That guard lives in the store instead of a
 *    ref here because the store is the thing that has to stay correct — a ref
 *    would only fix this one call site.
 */
export default function TrackListingView({ id }) {
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated || !id) return;
    useBazaarStore.getState().addRecentlyViewed(id);
  }, [hydrated, id]);

  return null;
}
