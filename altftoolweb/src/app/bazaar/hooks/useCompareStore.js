"use client";

/**
 * The compare tray: up to four listing ids the visitor is weighing up.
 *
 * Deliberately a SEPARATE store from `useBazaarStore`, not another field on it.
 * Saved ads, city and drafts are long-lived personal state; a comparison is a
 * short-lived working set that gets cleared the moment a decision is made.
 * Keeping them apart means clearing the tray can never touch a favourite, and
 * the two persist under different keys so a corrupt compare payload cannot
 * take saved ads down with it.
 *
 * Conventions match `useBazaarStore` exactly, and for the same reasons:
 *
 * 1. Empty on the server and on the first client render, hydrated from
 *    localStorage in an effect. Reading storage during render makes the
 *    prerendered HTML and the first client render disagree, which React
 *    reports as a hydration error. `useCompareHydrated()` lets components
 *    render the neutral state until the real one is known.
 * 2. Writes are best-effort. Private-mode Safari throws on setItem, and a
 *    marketplace that crashes because it cannot remember a comparison is
 *    worse than one that silently forgets it.
 */

import { useEffect } from "react";
import { create } from "zustand";

const STORAGE_KEY = "altf-bazaar-compare-v1";

/**
 * Four columns is the honest ceiling: it is the most that fits a phone's
 * horizontal scroll without the row labels losing their column, and past four
 * a comparison stops being a decision aid and becomes a spreadsheet.
 */
export const COMPARE_LIMIT = 4;

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: state.ids }));
  } catch {
    // Storage unavailable (private mode, quota). Session-only is acceptable.
  }
}

/** Drop non-strings, duplicates and anything past the cap. */
function sanitiseIds(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const id of value) {
    if (typeof id !== "string" || !id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= COMPARE_LIMIT) break;
  }
  return out;
}

export const useCompareStore = create((set, get) => ({
  hydrated: false,
  ids: [],

  /** Replace state from localStorage. Called once, from an effect. */
  hydrate: () => {
    if (get().hydrated) return;
    const stored = readStored();
    set({ hydrated: true, ids: sanitiseIds(stored?.ids) });
  },

  /** True while there is room for another ad. */
  canAddMore: () => get().ids.length < COMPARE_LIMIT,

  isComparing: (id) => get().ids.includes(id),

  /**
   * Add or remove an id.
   *
   * Returns a result rather than failing silently, so the button can say why
   * nothing happened. A control that does nothing on click and gives no
   * reason reads as broken.
   *
   * @returns {{ok: boolean, action: "added"|"removed"|"rejected", reason?: string}}
   */
  toggleCompare: (id) => {
    if (typeof id !== "string" || !id) {
      return { ok: false, action: "rejected", reason: "That ad cannot be compared." };
    }

    const { ids } = get();

    if (ids.includes(id)) {
      const next = ids.filter((s) => s !== id);
      set({ ids: next });
      persist({ ids: next });
      return { ok: true, action: "removed" };
    }

    if (ids.length >= COMPARE_LIMIT) {
      return {
        ok: false,
        action: "rejected",
        reason: `Compare holds ${COMPARE_LIMIT} ads. Remove one to add this.`,
      };
    }

    const next = [...ids, id];
    set({ ids: next });
    persist({ ids: next });
    return { ok: true, action: "added" };
  },

  removeCompare: (id) => {
    const next = get().ids.filter((s) => s !== id);
    set({ ids: next });
    persist({ ids: next });
  },

  clearCompare: () => {
    set({ ids: [] });
    persist({ ids: [] });
  },
}));

/**
 * Hydrates the compare store once and reports whether that has happened.
 *
 * Render the neutral (empty) state until this returns true, otherwise the
 * markup React produced on the server will not match the first client render.
 */
export function useCompareHydrated() {
  const hydrated = useCompareStore((s) => s.hydrated);

  useEffect(() => {
    useCompareStore.getState().hydrate();
  }, []);

  return hydrated;
}
