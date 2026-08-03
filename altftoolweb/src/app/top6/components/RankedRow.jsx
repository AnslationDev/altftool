"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Star } from "lucide-react";
import { safeExternalUrl } from "@/lib/top10/safeExternalUrl";

/**
 * One row of a Top6 list: position badge, provider photo, title, the
 * item's own description, and a link out to the provider's page.
 *
 * The badge is deliberately plain. The branch version painted #1 gold,
 * #2 silver and #3 bronze and stamped a "Top Pick" ribbon on the first
 * row — medal styling for what is only the provider's own ordering. The
 * rating renders only when the provider supplied one; nothing here is
 * derived, averaged, or scored by us.
 *
 * The class names come from top6.css (imported once by Top6Client) for
 * the byte reason documented in that file: this component is rendered
 * 66 times per document.
 */
export default function RankedRow({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = safeExternalUrl(item.image);
  const url = safeExternalUrl(item.url);
  // Number(null) is 0 and Number.isFinite(0) is true, so the obvious guard turned
  // "this provider reports no rating" into a rendered 0.0 star badge labelled
  // "Provider rating 0.0" — a number no provider supplied, published under its
  // name. Absence is checked before coercion; a genuine 0 still renders.
  const rawRating = item.rating;
  const rating =
    rawRating === null || rawRating === undefined || rawRating === ""
      ? null
      : Number.isFinite(Number(rawRating))
        ? Number(rawRating)
        : null;

  return (
    <article className="t6-row">
      <div className="t6-media">
        <span className="t6-rank">{item.rank}</span>
        <div className="t6-thumb">
          {!image || imageFailed ? (
            <div>
              <ImageOff className="h-6 w-6" aria-hidden="true" />
            </div>
          ) : (
            <Image
              src={image}
              alt={item.title}
              fill
              unoptimized
              sizes="(min-width:640px) 176px, 100vw"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
      </div>

      <div className="t6-body">
        <h3 className="t6-title">
          {item.title}
          {rating !== null && (
            <span
              className="t6-rating"
              aria-label={`Provider rating ${rating.toFixed(1)}`}
            >
              <Star className="h-3 w-3" aria-hidden="true" />
              <span aria-hidden="true">{rating.toFixed(1)}</span>
            </span>
          )}
        </h3>

        {item.subtitle && <p className="t6-sub">{item.subtitle}</p>}
        {item.description && <p className="t6-desc">{item.description}</p>}

        {url && (
          <a
            className="t6-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on the source site
          </a>
        )}
      </div>
    </article>
  );
}
