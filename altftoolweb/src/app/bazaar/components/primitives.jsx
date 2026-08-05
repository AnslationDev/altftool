import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";

import { getCategoryIcon } from "./categoryIcons";
import { T, TName } from "../i18n/T";

/**
 * Server-safe Bazaar primitives. No "use client" here on purpose — these are
 * rendered inside server pages so their markup stays in the prerendered HTML,
 * which is what the crawler and the 1 MiB prerender budget both care about.
 *
 * Locale: the DEFAULT copy in here (the "See all" link label, the empty-state
 * strings, Previous/Next, the category-tile name and count) renders through the
 * `<T>`/`<TName>` client leaves, so it follows the visitor's EN/हिन्दी choice
 * while this module stays a server module. Callers that pass their own strings
 * still get exactly what they passed. Attribute positions (`aria-label`) cannot
 * carry an element, so those stay English here — client callers translate them
 * with `useLocale()` directly.
 */

/**
 * Visible breadcrumb trail. Pages render this AND a matching BreadcrumbList
 * JSON-LD node; the two must describe the same path or the structured data is
 * a lie about the page.
 *
 * @param {{ items: Array<{ name: string, path?: string }> }} props
 */
export function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="bzr-crumbs">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1">
              {item.path && !last ? (
                <Link href={item.path}>{item.name}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-(--foreground)">
                  {item.name}
                </span>
              )}
              {/* A breadcrumb separator points "deeper", i.e. with the reading
                  direction — it flips under RTL. */}
              {last ? null : (
                <ChevronRight className="h-3 w-3 opacity-60 rtl:rotate-180" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Section heading with an optional "see all" link. */
export function SectionHead({
  title,
  href,
  linkLabel = <T id="section.seeAll" fallback="See all" />,
  as: Tag = "h2",
  children,
}) {
  return (
    <div className="bzr-section-head">
      <Tag className="bzr-section-title">{title}</Tag>
      {children}
      {href ? (
        <Link href={href} className="bzr-section-link">
          {linkLabel}{" "}
          <ChevronRight className="inline h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/** Category tile used on the home grid and the category directory. */
export function CategoryTile({ category, count }) {
  // `getCategoryIcon` is a lookup in a static module-level map, so this
  // identity is stable across renders and no state can be reset. The
  // react-hooks/static-components warning here is a false positive; the same
  // pattern is used in platform/navigation/Header.jsx.
  const Icon = getCategoryIcon(category.icon);
  return (
    <Link href={`/bazaar/c/${category.slug}`} className="bzr-cat-tile">
      <span className="bzr-cat-icon">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="bzr-cat-name">
        <TName kind="category" slug={category.slug} fallback={category.name} />
      </span>
      {typeof count === "number" ? (
        <span className="bzr-cat-count">
          <T
            id={count === 1 ? "section.adsCountOne" : "section.adsCount"}
            fallback={`${count.toLocaleString("en-IN")} ad${count === 1 ? "" : "s"}`}
            params={{ count: count.toLocaleString("en-IN") }}
          />
        </span>
      ) : null}
    </Link>
  );
}

/** Shown when a filter combination returns nothing. */
export function EmptyState({
  title = <T id="empty.title" fallback="No ads match those filters" />,
  message = (
    <T
      id="empty.message"
      fallback="Try widening the price range, clearing a filter, or searching a nearby city."
    />
  ),
  action,
}) {
  return (
    <div className="bzr-empty">
      <SearchX className="h-8 w-8 opacity-50" aria-hidden="true" />
      <p className="text-base font-semibold text-(--foreground)">{title}</p>
      <p className="max-w-md text-sm">{message}</p>
      {action}
    </div>
  );
}

/**
 * Link-based pagination.
 *
 * Deliberately anchors, not buttons: paginated listing pages are a real
 * crawlable surface, and a router.push-only control hides pages 2..n from
 * anything without JavaScript.
 *
 * @param {{ page: number, totalPages: number, buildHref: (page: number) => string }} props
 */
export function Pagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  // Window of pages around the current one, always including first and last.
  const pages = new Set([1, totalPages, page]);
  for (let offset = 1; offset <= 2; offset += 1) {
    if (page - offset >= 1) pages.add(page - offset);
    if (page + offset <= totalPages) pages.add(page + offset);
  }
  const ordered = [...pages].sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="bzr-chip" rel="prev">
          <T id="pagination.previous" fallback="Previous" />
        </Link>
      ) : null}

      {ordered.map((value, index) => {
        const previous = ordered[index - 1];
        const gap = previous && value - previous > 1;
        return (
          <span key={value} className="flex items-center gap-2">
            {gap ? <span className="text-(--muted-foreground)">…</span> : null}
            <Link
              href={buildHref(value)}
              className={`bzr-chip${value === page ? " is-active" : ""}`}
              aria-current={value === page ? "page" : undefined}
            >
              {value}
            </Link>
          </span>
        );
      })}

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="bzr-chip" rel="next">
          <T id="pagination.next" fallback="Next" />
        </Link>
      ) : null}
    </nav>
  );
}

/** Footer link cloud — the vertical's main internal-linking surface. */
export function LinkCloud({ title, links = [] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
        {title}
      </h3>
      <div className="bzr-linkcloud">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Inline advisory box (safety notice, animal-welfare notice, demo notice). */
export function Note({ icon: Icon, children }) {
  return (
    <p className="bzr-note">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" /> : null}
      <span>{children}</span>
    </p>
  );
}
