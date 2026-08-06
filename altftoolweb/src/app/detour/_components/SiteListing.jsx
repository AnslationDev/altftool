import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GoButton from "./GoButton";
import Pagination from "./Pagination";
import SiteCard from "./SiteCard";

/*
 * The shared body of every listing page — category, collection, mood and time
 * band are all "a heading, a paragraph, a grid and pagination", and the only
 * thing that varies is where the list came from.
 *
 * Keeping this in one place is what stops the four routes drifting apart in
 * spacing, empty state and pagination behaviour, which is exactly what happens
 * when each one is written separately.
 */

const PER_PAGE = 48;

export default function SiteListing({
  eyebrow,
  title,
  intro,
  sites,
  basePath,
  searchParams = {},
  backHref = "/detour/browse",
  backLabel = "All sites",
  // Filters scoping the button to this page, e.g. {category: "horror"}. Without
  // it, every listing page is a dead end for somebody who likes the topic but
  // does not want to read 48 cards to choose.
  spinFilters,
  spinLabel = "Surprise me from this list",
  children,
}) {
  const totalPages = Math.max(1, Math.ceil(sites.length / PER_PAGE));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1),
  );
  const visible = sites.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="mt-5 max-w-3xl">
        {eyebrow ? (
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--dtr-accent-text)" }}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        {intro ? (
          <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
            {intro}
          </p>
        ) : null}

        <p className="mt-4 font-mono text-sm text-muted-foreground">
          {sites.length.toLocaleString("en-GB")}{" "}
          {sites.length === 1 ? "site" : "sites"}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
      </header>

      {spinFilters && sites.length > 1 ? (
        <div className="mt-6 flex justify-center rounded-2xl border border-border bg-muted/30 p-5 sm:justify-start sm:p-6">
          <Suspense fallback={<div className="h-28" aria-hidden="true" />}>
            <GoButton filters={spinFilters} label={spinLabel} />
          </Suspense>
        </div>
      ) : null}

      {children}

      {visible.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. This is a gap in the directory rather than a gap in
          the internet — suggestions welcome.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </ul>
      )}

      <Pagination
        basePath={basePath}
        searchParams={searchParams}
        page={page}
        totalPages={totalPages}
      />
    </main>
  );
}
