/**
 * Space-reserving Suspense fallback for the browse grid.
 *
 * History, because this boundary has now been wrong in three different ways:
 *
 * 1. Real cards as the fallback → Next emits the fallback into the HTML
 *    TWICE (48 card elements for 24 unique ads, measured).
 * 2. `fallback={null}` → the duplication went away, but the page then PAINTS
 *    without the grid: the server streams the real grid inside a hidden
 *    `<div id="S:n">` container and React's `$RC` script moves it into place
 *    after first paint, shoving the link cloud and footer down. Measured CLS
 *    0.21–0.32 on the browse pages at 360px (audit §4.4) — everything else
 *    on the vertical is ≤0.04.
 * 3. This: skeleton boxes with the same aspect-ratio media block and a body
 *    tall enough to approximate a card. Reserves the grid's space so the
 *    late-arriving content replaces equal height instead of inserting it.
 *    Being empty boxes, duplication costs bytes, not duplicate content or
 *    image URLs.
 *
 * Server-safe on purpose — it renders inside the prerendered HTML.
 */
export default function ResultsSkeleton({ cards = 24 }) {
  return (
    <div className="bzr-grid" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[var(--bzr-radius)] border border-(--border) bg-(--card)"
        >
          <div className="aspect-[4/3] animate-pulse bg-(--bzr-media)" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-2/5 animate-pulse rounded bg-(--bzr-media)" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-(--bzr-media)" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-(--bzr-media)" />
          </div>
        </div>
      ))}
    </div>
  );
}
