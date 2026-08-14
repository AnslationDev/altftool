import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/*
 * Server-rendered pagination.
 *
 * Real <a> elements rather than buttons, so each page is a crawlable URL and
 * middle-clicking works. `rel="prev"/"next"` is still the clearest signal to a
 * crawler that a long list is one sequence rather than a set of near-duplicate
 * pages competing with each other.
 */

function buildHref(basePath, searchParams, page) {
  const params = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (key === "page" || value === undefined) return;
    params.set(key, Array.isArray(value) ? value[0] : String(value));
  });
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}) {
  if (totalPages <= 1) return null;

  // A window around the current page keeps the control usable at 60 pages
  // without rendering 60 links.
  const window = 2;
  const pages = [];
  for (let index = 1; index <= totalPages; index += 1) {
    const inWindow = Math.abs(index - page) <= window;
    if (index === 1 || index === totalPages || inWindow) pages.push(index);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={buildHref(basePath, searchParams, page - 1)}
          rel="prev"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Link>
      ) : null}

      {pages.map((entry, index) =>
        entry === "…" ? (
          <span
            key={`gap-${index}`}
            className="px-1.5 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={buildHref(basePath, searchParams, entry)}
            aria-current={entry === page ? "page" : undefined}
            className={`min-w-9 rounded-lg border px-2.5 py-1.5 text-center text-sm transition-colors ${
              entry === page
                ? "border-[var(--dtr-accent)] bg-[var(--dtr-accent)] font-semibold text-[var(--dtr-accent-foreground)]"
                : "border-border hover:bg-muted"
            }`}
          >
            {entry}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, searchParams, page + 1)}
          rel="next"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
