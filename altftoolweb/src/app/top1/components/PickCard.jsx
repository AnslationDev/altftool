"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, ImageOff, Star } from "lucide-react";
import { safeExternalUrl } from "@/lib/top10/safeExternalUrl";

/**
 * One category's lead entry.
 *
 * Heading text is the category name, because that is the part we can
 * stand behind; the eyebrow says where the entry's position comes from
 * rather than implying we chose it. Rating renders only when the
 * provider supplied one.
 */
export default function PickCard({ pick, eyebrow }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { item, icon: Icon } = pick;
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
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-(--border) bg-(--card) transition-shadow duration-150 hover:shadow-md motion-reduce:transition-none">
      <div className="relative h-44 w-full bg-(--muted)">
        {!image || imageFailed ? (
          <div className="flex h-full w-full items-center justify-center text-(--muted-foreground)">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={image}
            alt={item.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-(--primary-text) font-secondary">
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {pick.tag}
        </p>
        <h3 className="mt-2 font-primary text-xl font-extrabold leading-tight text-(--foreground)">
          {pick.label}
        </h3>
        <p className="mt-1 text-xs text-(--muted-foreground) font-secondary">
          {eyebrow}
        </p>

        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-secondary">
          <span className="text-base font-semibold text-(--foreground)">
            {item.title}
          </span>
          {rating !== null && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-(--warning-soft) px-2 py-0.5 text-xs font-semibold text-(--warning-text)"
              aria-label={`Provider rating ${rating.toFixed(1)}`}
            >
              <Star className="h-3 w-3" aria-hidden="true" />
              <span aria-hidden="true">{rating.toFixed(1)}</span>
            </span>
          )}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-(--muted-foreground) font-secondary">
            {item.subtitle}
          </p>
        )}
        {item.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-(--muted-foreground) font-secondary">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 pt-4 font-secondary">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--primary-text) hover:text-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              Open on the source site
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          {pick.sectionId && (
            <a
              href={`/top10#${pick.sectionId}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-(--primary-text) hover:text-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              All ten on Top10
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
