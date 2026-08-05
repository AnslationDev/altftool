"use client";

/**
 * Tiny client leaves that let SERVER components render locale-switchable text
 * without becoming client components themselves.
 *
 * `<T id="home.hero.title" fallback="Buy. Sell. Nearby." />` serialises as one
 * client-component reference plus ~40 bytes of props in the RSC payload; the
 * host page (HomeHero, SafetyTips, the primitives) stays server-rendered, its
 * copy stays in the prerendered HTML, and the prerender budget is untouched.
 * This is the deliberate alternative to slapping "use client" on whole home
 * sections, which would move their entire subtree into the client bundle.
 *
 * Hydration: `useLocale()` reports `en` until the store has read localStorage,
 * so the server HTML (English) and the first client render agree by
 * construction. The swap to Hindi happens in a post-hydration render.
 *
 * When the resolved text is genuinely Hindi it is wrapped in
 * `<span lang="hi">` so screen readers switch phonology; English fallbacks
 * carry no lang attribute (see `langForId` in strings.js).
 *
 * Attribute positions (`aria-label={...}`, `placeholder={...}`) cannot take an
 * element — those stay English inside server components. Client components use
 * `useLocale().t` directly instead of these leaves.
 */

import { useLocale } from "./useLocale";

/**
 * @param {{ id: string, fallback?: string, params?: Record<string, unknown> }} props
 */
export function T({ id, fallback, params }) {
  const { t, langOf } = useLocale();
  const text = t(id, fallback, params);
  const lang = langOf(id);
  return lang ? <span lang={lang}>{text}</span> : text;
}

/**
 * Taxonomy name — category or sub-category — translated for the active locale,
 * falling back to the English name from `data/categories.js` (the single
 * source of truth for English taxonomy names).
 *
 * @param {{ kind?: "category"|"subcategory", slug: string, fallback: string }} props
 */
export function TName({ kind = "category", slug, fallback }) {
  const { categoryName, subcategoryName, langOfCategory, langOfSubcategory } = useLocale();
  const isSub = kind === "subcategory";
  const text = isSub ? subcategoryName(slug, fallback) : categoryName(slug, fallback);
  const lang = isSub ? langOfSubcategory(slug) : langOfCategory(slug);
  return lang ? <span lang={lang}>{text}</span> : text;
}
