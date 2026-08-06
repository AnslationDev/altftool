// Animal Hub image wrapper around next/image.
//
// Contract-driven: takes an image descriptor shaped like the data files'
// media entries ({ src, alt, credit }) or plain props. Renders a fixed
// aspect-ratio frame with `fill` so layouts never shift, serves AVIF/WebP
// via the platform image pipeline, lazy-loads by default, and shows the
// module's hatched neutral frame when no src exists — an intentional empty
// state instead of a broken image.
//
// `credit` is deliberately NOT rendered. It stays on the record as
// provenance — who the photograph came from — but the design keeps imagery
// uncaptioned. Attribution, where a licence requires it, belongs on a
// credits page built from the same field rather than over every photo.

import Image from "next/image";
import clsx from "clsx";

/**
 * `image`: { src, alt, credit } descriptor (or pass src/alt directly).
 * `ratio`: CSS aspect-ratio ("4 / 3" default; "3 / 2", "1 / 1", "16 / 9" …).
 * `sizes`: responsive hint — REQUIRED thinking per placement; default suits
 *          a 3-across card grid.
 * `rounded`: hairline-bordered rounded frame (off for full-bleed heroes).
 * `priority`: only for above-the-fold heroes.
 */
export function AhImage({
  image,
  src,
  alt,
  ratio = "4 / 3",
  sizes = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw",
  fit = "cover",
  rounded = true,
  priority = false,
  fallbackLabel,
  fallbackNote,
  className,
}) {
  const resolvedSrc = image?.src ?? src;
  const resolvedAlt = image?.alt ?? alt ?? "";

  // No photograph yet: render a composed monogram frame rather than a blank
  // box, so a record awaiting imagery still reads as designed.
  if (!resolvedSrc) {
    const monogram = String(fallbackLabel || "").trim().charAt(0).toUpperCase();
    return (
      <div
        className={clsx("ah-image ah-image--empty", rounded && "ah-image--rounded", className)}
        style={{ aspectRatio: ratio }}
        role={fallbackLabel ? "img" : undefined}
        aria-label={fallbackLabel ? `${fallbackLabel} — photograph coming soon` : undefined}
        aria-hidden={fallbackLabel ? undefined : "true"}
      >
        {monogram ? <span className="ah-image__monogram">{monogram}</span> : null}
        {fallbackNote ? <span className="ah-image__note">{fallbackNote}</span> : null}
      </div>
    );
  }

  return (
    <div
      className={clsx("ah-image", rounded && "ah-image--rounded", className)}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={resolvedSrc}
        alt={resolvedAlt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
