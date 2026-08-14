import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORY_BY_SLUG } from "@altftool/core/atlas/taxonomy";
import { AccessPill, LegacyPill, RuntimePill, StatusPill } from "./Pills";

/**
 * Monogram plate.
 *
 * Deliberately NOT a favicon. Pulling 80 favicons from a third-party service
 * on a browse page would tell that service exactly which directory pages a
 * visitor reads — an odd thing for a product whose flagship collection is
 * "nothing leaves your device". Two mono characters tinted by access level
 * also scan more consistently than a grid of mismatched 16px logos.
 */
export function SitePlate({ name, size = "md", className = "" }) {
  const monogram = String(name || "?")
    .replace(/^(the|a)\s+/i, "")
    .slice(0, 2);

  const dims = {
    sm: "h-8 w-8 rounded-md text-[0.6875rem]",
    md: "h-10 w-10 rounded-lg text-xs",
    lg: "h-14 w-14 rounded-xl text-base",
  }[size];

  return (
    <span
      aria-hidden="true"
      className={`afa-plate border border-border ${dims} ${className}`}
    >
      <span className="afa-plate__mono">{monogram}</span>
    </span>
  );
}

const ACCESS_CLASS = {
  open: "afa-access-open",
  account: "afa-access-account",
  freemium: "afa-access-freemium",
};

/**
 * The catalog's primary unit.
 *
 * The whole card is clickable via a stretched overlay on the title link
 * rather than by wrapping everything in an <a> — that keeps the "open the
 * real site" anchor a genuine sibling link instead of an invalid nested one,
 * and keeps the accessible name of the card link to the site's actual name.
 */
export default function SiteCard({ entry, showCategory = true }) {
  if (!entry) return null;

  const retired = entry.status === "retired";
  const accessClass = retired
    ? "afa-access-retired"
    : ACCESS_CLASS[entry.access] || "";
  const category = CATEGORY_BY_SLUG[entry.category];

  return (
    <article
      className={`afa-card afa-stripe ${accessClass} ${
        retired ? "afa-card--retired" : ""
      } relative isolate flex h-full flex-col gap-3 rounded-lg border border-border p-4`}
    >
      <div className="flex items-start gap-3">
        <SitePlate name={entry.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">
            <Link
              href={`/altfatlas/site/${entry.slug}`}
              prefetch={false}
              className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {entry.name}
            </Link>
          </h3>
          <p className="afa-domain mt-0.5">{entry.domain}</p>
        </div>

        {entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={`Open ${entry.name} in a new tab`}
            title={`Open ${entry.domain}`}
            className="relative z-10 -m-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
        {entry.tagline}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {retired ? (
          <StatusPill status={entry.status} />
        ) : (
          <>
            <AccessPill access={entry.access} />
            <RuntimePill runtime={entry.runtime} />
          </>
        )}
        <LegacyPill legacy={entry.legacy} />
        {showCategory && category ? (
          <span className="afa-domain ml-auto hidden truncate sm:inline">
            {category.name}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** Grid + empty state in one place so every listing page behaves identically. */
export function SiteGrid({ entries = [], showCategory = true, empty }) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm font-semibold text-foreground">
          {empty?.title || "Nothing here yet"}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {empty?.body ||
            "No entries match this combination. Try removing a filter."}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.slug} className="min-w-0">
          <SiteCard entry={entry} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
