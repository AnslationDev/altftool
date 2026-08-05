"use client";

/**
 * Client-side Bazaar state: saved ads, the chosen city, recent searches and
 * the ads the visitor has "posted" in this browser.
 *
 * There is no backend yet, so this is the whole persistence story — zustand
 * with a localStorage mirror. Two things matter for correctness:
 *
 * 1. The store must start EMPTY on the server and on the first client render,
 *    then hydrate from localStorage in an effect. Reading localStorage during
 *    render would make the server HTML and the first client render disagree,
 *    which React reports as a hydration error. `useHydrated()` exists so
 *    components can render the neutral state until the real one is known.
 * 2. Writes are best-effort. Private-mode Safari throws on setItem, and a
 *    marketplace that crashes because it cannot remember a favourite is worse
 *    than one that silently forgets.
 */

import { useEffect } from "react";
import { create } from "zustand";

const STORAGE_KEY = "altf-bazaar-state-v1";
const DEFAULT_CITY = "mumbai";

/** Return-visit rails stay short; an unbounded history is a memory leak in localStorage. */
const RECENTLY_VIEWED_LIMIT = 20;

function readStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        savedIds: state.savedIds,
        citySlug: state.citySlug,
        recentSearches: state.recentSearches,
        myAds: state.myAds,
        recentlyViewed: state.recentlyViewed,
        savedSearches: state.savedSearches,
        savedSearchSeq: state.savedSearchSeq,
        offers: state.offers,
        offerSeq: state.offerSeq,
      }),
    );
  } catch {
    // Storage unavailable (private mode, quota). Session-only is acceptable.
  }
}

export const useBazaarStore = create((set, get) => ({
  hydrated: false,
  savedIds: [],
  citySlug: DEFAULT_CITY,
  recentSearches: [],
  myAds: [],
  recentlyViewed: [],
  savedSearches: [],
  // Monotonic counter that labels and orders saved searches. Deliberately not a
  // timestamp: `Date.now()` in rendered output makes the server HTML and the
  // first client render disagree, and there is no server clock to agree with.
  savedSearchSeq: 0,
  // Offers the visitor has made on other people's ads. Negotiation is how
  // Indian classifieds actually work, so an offer is first-class state rather
  // than a chat message — the detail page reads it back to say "You offered ₹X".
  offers: [],
  // Same reasoning as savedSearchSeq: a counter, not a clock. Offer ids must be
  // stable across a reload and must not depend on Date.now().
  offerSeq: 0,

  /** Replace state from localStorage. Called once, from an effect. */
  hydrate: () => {
    if (get().hydrated) return;
    const stored = readStored();
    set({
      hydrated: true,
      savedIds: Array.isArray(stored?.savedIds) ? stored.savedIds : [],
      citySlug: typeof stored?.citySlug === "string" ? stored.citySlug : DEFAULT_CITY,
      recentSearches: Array.isArray(stored?.recentSearches) ? stored.recentSearches : [],
      myAds: Array.isArray(stored?.myAds) ? stored.myAds : [],
      recentlyViewed: Array.isArray(stored?.recentlyViewed) ? stored.recentlyViewed : [],
      savedSearches: Array.isArray(stored?.savedSearches) ? stored.savedSearches : [],
      savedSearchSeq:
        typeof stored?.savedSearchSeq === "number" && stored.savedSearchSeq >= 0
          ? stored.savedSearchSeq
          : 0,
      offers: Array.isArray(stored?.offers) ? stored.offers : [],
      offerSeq:
        typeof stored?.offerSeq === "number" && stored.offerSeq >= 0 ? stored.offerSeq : 0,
    });
  },

  toggleSaved: (id) => {
    const { savedIds } = get();
    const next = savedIds.includes(id)
      ? savedIds.filter((s) => s !== id)
      : [id, ...savedIds];
    set({ savedIds: next });
    persist({ ...get(), savedIds: next });
  },

  isSaved: (id) => get().savedIds.includes(id),

  setCity: (citySlug) => {
    set({ citySlug });
    persist({ ...get(), citySlug });
  },

  addRecentSearch: (term) => {
    const clean = String(term || "").trim();
    if (!clean) return;
    const next = [clean, ...get().recentSearches.filter((s) => s !== clean)].slice(0, 8);
    set({ recentSearches: next });
    persist({ ...get(), recentSearches: next });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    persist({ ...get(), recentSearches: [] });
  },

  addMyAd: (ad) => {
    const next = [{ ...ad, id: ad.id || `draft-${get().myAds.length + 1}` }, ...get().myAds];
    set({ myAds: next });
    persist({ ...get(), myAds: next });
  },

  removeMyAd: (id) => {
    const next = get().myAds.filter((a) => a.id !== id);
    set({ myAds: next });
    persist({ ...get(), myAds: next });
  },

  updateMyAd: (id, patch) => {
    const next = get().myAds.map((a) => (a.id === id ? { ...a, ...patch } : a));
    set({ myAds: next });
    persist({ ...get(), myAds: next });
  },

  /**
   * Record that a listing was opened. Most recent first, de-duplicated, capped.
   * Re-viewing an ad moves it to the front rather than adding a second entry —
   * a "recently viewed" rail showing the same ad three times is noise.
   */
  addRecentlyViewed: (id) => {
    if (!id) return;
    const current = get().recentlyViewed;
    // Already at the front: nothing changes, so skip the write. This also makes
    // the action idempotent under React StrictMode's double effect invocation.
    if (current[0] === id) return;
    const next = [id, ...current.filter((x) => x !== id)].slice(0, RECENTLY_VIEWED_LIMIT);
    set({ recentlyViewed: next });
    persist({ ...get(), recentlyViewed: next });
  },

  clearRecentlyViewed: () => {
    set({ recentlyViewed: [] });
    persist({ ...get(), recentlyViewed: [] });
  },

  /**
   * Store a saved search. The caller supplies `{ id, label, query, path, chips }`;
   * the counter-derived `createdAtLabel` and the default alert preference are
   * filled in here so every entry is labelled the same way.
   *
   * `id` is derived from the URL, so saving the same filter set twice is a
   * no-op rather than a duplicate row.
   */
  addSavedSearch: (search) => {
    if (!search?.id) return;
    if (get().savedSearches.some((s) => s.id === search.id)) return;
    const seq = get().savedSearchSeq + 1;
    const entry = {
      alerts: false,
      ...search,
      createdAtLabel: `Saved search #${seq}`,
    };
    const next = [entry, ...get().savedSearches];
    set({ savedSearches: next, savedSearchSeq: seq });
    persist({ ...get(), savedSearches: next, savedSearchSeq: seq });
  },

  removeSavedSearch: (id) => {
    const next = get().savedSearches.filter((s) => s.id !== id);
    set({ savedSearches: next });
    persist({ ...get(), savedSearches: next });
  },

  toggleSearchAlerts: (id) => {
    const next = get().savedSearches.map((s) =>
      s.id === id ? { ...s, alerts: !s.alerts } : s,
    );
    set({ savedSearches: next });
    persist({ ...get(), savedSearches: next });
  },

  clearSavedSearches: () => {
    // The counter is intentionally NOT reset: "Saved search #3" should not be
    // handed out twice in one browser, or two rows in a screenshot disagree.
    set({ savedSearches: [] });
    persist({ ...get(), savedSearches: [] });
  },

  /**
   * Record an offer on a listing.
   *
   * The caller supplies `{ listingId, amount, note?, askingPrice?, listingTitle?,
   * listingSlug? }`; the id, the ordering label and `status` are filled in here
   * so every entry is shaped the same way.
   *
   * A second offer on the same listing REPLACES the first rather than stacking.
   * A buyer who revises "₹40,000" to "₹42,000" has one offer, not two, and the
   * detail page has to be able to say which number is current without guessing.
   * The replacement keeps its position in the list so the rail does not reorder
   * under the visitor while they are looking at it.
   */
  addOffer: (offer) => {
    const listingId = offer?.listingId;
    const amount = Math.round(Number(offer?.amount));
    if (!listingId || !Number.isFinite(amount) || amount < 0) return;

    const seq = get().offerSeq + 1;
    const entry = {
      ...offer,
      id: `offer-${seq}`,
      listingId,
      amount,
      note: typeof offer?.note === "string" ? offer.note.trim() : "",
      status: "sent",
      createdAtLabel: `Offer #${seq}`,
    };

    const existing = get().offers;
    const index = existing.findIndex((o) => o.listingId === listingId);
    const next =
      index === -1
        ? [entry, ...existing]
        : existing.map((o, i) => (i === index ? entry : o));

    set({ offers: next, offerSeq: seq });
    persist({ ...get(), offers: next, offerSeq: seq });
  },

  removeOffer: (id) => {
    const next = get().offers.filter((o) => o.id !== id);
    set({ offers: next });
    persist({ ...get(), offers: next });
  },

  /**
   * The current offer on a listing, or null.
   *
   * This is what lets the detail page greet a returning visitor with
   * "You offered ₹X" instead of an empty form they have already filled in.
   * Callers that need to re-render on change must subscribe to `offers` and
   * call this from the render body — a getter is not a subscription.
   */
  getOfferFor: (listingId) =>
    (listingId ? get().offers.find((o) => o.listingId === listingId) : null) || null,

  /** How many offers have been made on one listing — 0 or 1 by construction. */
  offerCountFor: (listingId) =>
    listingId ? get().offers.filter((o) => o.listingId === listingId).length : 0,
}));

/**
 * Hydrates the store once and reports whether that has happened.
 *
 * Render the neutral (empty) state until this returns true, otherwise the
 * markup React produced on the server will not match the first client render.
 */
export function useHydrated() {
  const hydrated = useBazaarStore((s) => s.hydrated);

  // No local `mounted` flag: `hydrate()` flips `hydrated` in the store, and
  // subscribing to it above already re-renders us. Tracking the same fact in
  // component state as well would mean a second setState inside this effect
  // for no extra information.
  useEffect(() => {
    useBazaarStore.getState().hydrate();
  }, []);

  return hydrated;
}
