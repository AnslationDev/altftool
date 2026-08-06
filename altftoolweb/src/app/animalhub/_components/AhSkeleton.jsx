// Animal Hub skeleton loaders.
//
// Shimmering placeholders that mirror the real primitives' geometry (same
// radius, same card frame, same grid) so loading states feel like the page
// settling, not a different page. Shimmer respects prefers-reduced-motion
// via the module stylesheet.

import clsx from "clsx";
import { AhCard, AhCardBody } from "./AhCard";
import { AhContainer, AhGrid, AhSection } from "./AhLayout";

/**
 * One shimmer block. `variant`: "line" | "title" | "pill" | "media"
 * (media takes `ratio`, default "4 / 3"). Bare (no variant) fills whatever
 * width/height the parent gives it via className/style.
 */
export function AhSkeleton({ variant, ratio = "4 / 3", className, style }) {
  return (
    <span
      className={clsx(
        "ah-skeleton",
        variant && variant !== "media" && `ah-skeleton--${variant}`,
        className,
      )}
      style={{
        display: "block",
        ...(variant === "media" ? { aspectRatio: ratio } : null),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/** A paragraph of shimmer lines; the last line is shortened like real text. */
export function AhSkeletonText({ lines = 3, className }) {
  return (
    <span className={clsx("ah-skeleton-text", className)} style={{ display: "grid" }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <AhSkeleton key={i} variant="line" />
      ))}
    </span>
  );
}

/** A card-shaped skeleton using the real card frame. */
export function AhSkeletonCard() {
  return (
    <AhCard aria-hidden="true">
      <AhSkeleton variant="media" />
      <AhCardBody>
        <AhSkeleton variant="pill" />
        <AhSkeleton variant="title" />
        <AhSkeletonText lines={2} />
      </AhCardBody>
    </AhCard>
  );
}

/**
 * Full listing-page skeleton: section header ghost + a grid of card ghosts.
 * Used by the module's loading.jsx files; reusable for any listing surface.
 */
export function AhListingSkeleton({ cards = 6 }) {
  return (
    <AhSection as="main" aria-busy="true">
      <AhContainer>
        <span className="sr-only">Loading…</span>
        <div className="ah-section-head" aria-hidden="true">
          <div className="ah-section-head__main">
            <AhSkeleton variant="pill" />
            <AhSkeleton variant="title" style={{ height: "2.25rem", maxWidth: "20rem" }} />
            <AhSkeletonText lines={2} />
          </div>
        </div>
        <AhGrid variant="cols-3" aria-hidden="true">
          {Array.from({ length: cards }, (_, i) => (
            <AhSkeletonCard key={i} />
          ))}
        </AhGrid>
      </AhContainer>
    </AhSection>
  );
}
