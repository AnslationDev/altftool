/**
 * "Skip to results" — a second skip link, scoped to the browse pages.
 *
 * ---------------------------------------------------------------------------
 * Why the site-wide skip link is not enough here
 * ---------------------------------------------------------------------------
 * Measured with real Tab presses on the browse pages (Chrome, 1280x900):
 *
 *   /bazaar/c/cars              195 Tab presses from page load to the first
 *                               result card. After activating the global
 *                               "Skip to main content" link: still **61**.
 *   /bazaar/search?q=iphone     156 cold · 22 after the global skip link.
 *
 * The global link targets `#main-content`, which on a Bazaar browse page is
 * still above the sub-header (city picker, search field, Sell), the locale
 * strip, the breadcrumbs and then the filter rail — and the cars rail alone is
 * 41 focus stops. A keyboard or switch user who wants the ads has to traverse
 * every filter first, on every page, every time. That is the whole point of
 * WCAG 2.4.1: a mechanism to bypass repeated blocks.
 *
 * ---------------------------------------------------------------------------
 * Implementation notes
 * ---------------------------------------------------------------------------
 * The hidden and focused states are both written out property by property
 * instead of leaning on `sr-only` / `focus:not-sr-only`, for two reasons.
 *
 * 1. Tailwind v4's `sr-only` hides with `clip-path: inset(50%)`, and a
 *    `focus:`-variant list that overrides position/size but forgets
 *    `clip-path` produces a link that is laid out, focused, outlined — and
 *    still invisible. That was the first version of this file, and the
 *    verification run caught it: `clip-path` still computed to `inset(50%)`
 *    while focused.
 * 2. `not-sr-only` restores `position: static`, which would drop the link into
 *    the flow and push the page down the moment it takes focus — a layout
 *    shift caused by pressing Tab. `fixed` cannot shift anything, and
 *    sidesteps the containing-block question `absolute` would raise inside a
 *    component whose ancestors are not positioned. Measured: 0 layout shift
 *    between focusing and activating the link.
 *
 * The target needs `tabIndex={-1}` for the jump to move *focus* and not just
 * the scroll position — an `id` on a plain `<div>` is scrolled to but not
 * focused, so the next Tab would carry on from the skip link instead of from
 * the results.
 *
 * Server-safe: no state, no hooks, no "use client".
 */
export default function SkipToResults({ targetId, label = "Skip to results" }) {
  return (
    <a
      href={`#${targetId}`}
      className={[
        // hidden but reachable
        "absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap [clip-path:inset(50%)]",
        // revealed on focus, out of the flow so nothing moves
        "focus:fixed focus:start-4 focus:top-28 focus:z-50 focus:m-0 focus:h-auto focus:w-auto",
        "focus:overflow-visible focus:[clip-path:none] focus:inline-flex focus:items-center",
        "focus:rounded-[var(--anslation-ds-radius-sm,0.5rem)] focus:border focus:border-(--primary)",
        "focus:bg-(--card) focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-(--foreground)",
        "focus:shadow-[var(--anslation-ds-shadow-md)]",
        "focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-(--primary)",
      ].join(" ")}
    >
      {label}
    </a>
  );
}
