/**
 * Shared palette for the companion sections under the Step Counter
 * (ExploreFitnessTools, StepFaqAbout).
 *
 * WHY NOT THE TRACKER'S OWN TOKENS: an earlier draft of this file pointed at
 * `var(--scv2-*)`, which are defined on the tracker's `.scv2-scope` wrapper.
 * These sections are SIBLINGS of that wrapper, not descendants, so those
 * references would have been invalid at computed-value time — card backgrounds
 * falling back to transparent, text colours silently inherited.
 *
 * They now resolve through the platform's global semantic tokens (master.md §2
 * / §3), which are defined on :root and switch with `[data-theme="dark"]` — so
 * the sections are correct in both themes and match the rest of the site
 * instead of a palette invented for one tool.
 *
 * The keys keep their historical names (including `indigo`, which is now the
 * brand teal) so both consumers read unchanged.
 */

export const THEME = {
  // surfaces
  card: "var(--surface, #FFFFFF)",
  tile: "var(--surface-soft, #EEF3F6)",
  shadow: "var(--shadow-sm, 0 1px 2px rgb(15 23 42 / 6%))",

  // text
  ink: "var(--foreground, #111827)",
  muted: "var(--muted-foreground, #607083)",
  faint: "var(--muted-foreground, #607083)",

  // accent — historically spelled `indigo`; it is the platform primary (teal)
  indigo: "var(--primary-text, #0F766E)",
  indigoSoft: "var(--primary-soft, #CCFBF1)",
  // Both consumers put WHITE text on this gradient, so it is pinned to the
  // darker end of the brand ramp (Teal-700 → Teal-600) rather than the
  // primary→secondary CTA gradient: white on Cyan-400 is ~1.9:1 and fails AA.
  // The ramp primitives do not change between themes, so white stays ≥4.5:1 in
  // light and dark alike.
  grad:
    // Both stops carry white at AA: brand-800 7.58:1, brand-700 5.47:1.
    // The previous brand-700 -> brand-600 ramp dropped to 3.74:1 across the
    // lower half of every pill, and both consumers put white text on it.
    "linear-gradient(135deg, var(--anslation-ds-brand-800, #115E59), var(--anslation-ds-brand-700, #0F766E))",

  // status
  orange: "var(--warning-text, #B45309)",
  danger: "var(--anslation-ds-danger-text, #B91C1C)",
};

export default THEME;
