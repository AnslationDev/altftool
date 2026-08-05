"use client";

/**
 * Bazaar interface locale — the client-side store and the hook components use.
 *
 * WHY ITS OWN STORE AND NOT A FIELD ON `useBazaarStore`
 * ----------------------------------------------------
 * The locale is the one piece of Bazaar state that every component reads and
 * nothing else depends on, and `hooks/useBazaarStore.js` is shared with other
 * work in flight. A four-line store with its own localStorage key
 * (`altf-bazaar-locale-v1`) keeps this feature self-contained: nobody merging
 * a favourites or saved-search change has to reason about it, and a corrupt
 * locale value cannot take the saved-ads list down with it. The trade-off is
 * one extra `localStorage` read on mount, which is a synchronous single-key
 * lookup. If the locale later needs to move into the main store, add the field
 * to its initial state, `hydrate()` AND `persist()` — all three.
 *
 * HYDRATION — the thing that breaks first
 * ---------------------------------------
 * The server has no idea which locale this visitor chose, so it renders `en`.
 * Therefore the FIRST client render must also be `en`, and only a subsequent
 * render may switch to Hindi. `useLocale()` enforces that by ignoring the
 * stored value until `hydrated` is true, exactly as `useHydrated()` does in
 * `hooks/useBazaarStore.js`. Read the store's `locale` directly and you will
 * get a hydration mismatch on the very first Hindi page load.
 *
 * No React context provider: zustand is already a module-level subscription, so
 * a provider would add a tree to maintain and buy nothing. Any client component
 * anywhere under `/bazaar` can call `useLocale()` directly.
 */

import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { DEFAULT_LOCALE, LOCALES, createTranslator, isLocale } from "./strings";

const STORAGE_KEY = "altf-bazaar-locale-v1";

function readStoredLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(raw) ? raw : DEFAULT_LOCALE;
  } catch {
    // Private-mode Safari throws on access. English is a fine answer.
    return DEFAULT_LOCALE;
  }
}

function persistLocale(locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage unavailable or full. Session-only is acceptable; a marketplace
    // that crashes because it cannot remember a language preference is worse.
  }
}

export const useBazaarLocaleStore = create((set, get) => ({
  hydrated: false,
  /** Never read this directly in a component — go through `useLocale()`. */
  locale: DEFAULT_LOCALE,

  /** Replace state from localStorage. Called once, from an effect. */
  hydrate: () => {
    if (get().hydrated) return;
    set({ hydrated: true, locale: readStoredLocale() });
  },

  setLocale: (next) => {
    const locale = isLocale(next) ? next : DEFAULT_LOCALE;
    if (get().locale === locale) return;
    set({ locale });
    persistLocale(locale);
  },
}));

/**
 * The locale to render with, plus the bound translator.
 *
 * `locale` is `"en"` until hydration completes, so server HTML and the first
 * client render always agree. `hydrated` is exposed for the rare component that
 * needs to suppress a locale-dependent flash of its own.
 *
 * @returns {{
 *   locale: string,
 *   hydrated: boolean,
 *   isHindi: boolean,
 *   htmlLang: string,
 *   setLocale: (locale: string) => void,
 *   t: (id: string, fallbackOrParams?: unknown, params?: object) => string,
 *   langOf: (id: string) => string|undefined,
 *   categoryName: (slug: string, englishName?: string) => string,
 *   subcategoryName: (slug: string, englishName?: string) => string,
 *   attributeLabel: (key: string, englishLabel?: string) => string,
 * }}
 */
export function useLocale() {
  const hydrated = useBazaarLocaleStore((s) => s.hydrated);
  const stored = useBazaarLocaleStore((s) => s.locale);
  const setLocale = useBazaarLocaleStore((s) => s.setLocale);

  // `hydrate()` flips `hydrated` in the store and we are subscribed to it, so
  // no local mounted flag is needed — the same reasoning as `useHydrated()`.
  useEffect(() => {
    useBazaarLocaleStore.getState().hydrate();
  }, []);

  const locale = hydrated ? stored : DEFAULT_LOCALE;

  // Memoised so the returned helpers are referentially stable while the locale
  // does not change; that keeps them safe in dependency arrays.
  const translator = useMemo(() => createTranslator(locale), [locale]);

  return { ...translator, hydrated, setLocale };
}

export { LOCALES, DEFAULT_LOCALE };
