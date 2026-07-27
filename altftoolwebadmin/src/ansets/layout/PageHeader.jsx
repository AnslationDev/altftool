import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@altftool/ui";

/**
 * Trail above the page title. Rendered by PageHeader when `breadcrumbs` is
 * passed; exported separately only for screens that need it outside a header.
 *
 * The last item is always the current page: it is never a link and carries
 * aria-current="page".
 *
 * @param {Array<{label: string, href?: string}>} items
 */
export function Breadcrumbs({ items = [], className }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-3", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : null}
              {isLast || !item.href ? (
                <span
                  className={isLast ? "font-medium text-[var(--foreground)]" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The single page header for every admin screen.
 *
 * Before this existed each page hand-rolled its own: Admin Management used
 * `text-xl font-bold`, Security used `text-2xl font-semibold` under an eyebrow,
 * others used something else again — so the same semantic element rendered at
 * three different scales depending on which screen you were on.
 *
 * @param {string}      [eyebrow]     Small uppercase kicker above the title.
 * @param {import("react").ElementType} [icon] Lucide icon rendered beside the title.
 * @param {string}      title         The page title. Rendered as the page's only h1.
 * @param {string}      [description] One or two lines explaining what the screen does.
 * @param {ReactNode}   [actions]     Buttons/links pinned to the right of the title row.
 * @param {ReactNode}   [children]    Anything that belongs under the header (tabs, filters).
 * @param {Array<{label: string, href?: string}>} [breadcrumbs] Trail above the
 *   title. Sub-pages (Admin Management > Audit Log, Health > Tools) had no way
 *   back except the browser button before this.
 */
export function PageHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
}) {
  return (
    <header className={cn("mb-6", className)}>
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              "flex items-center gap-2 text-2xl font-semibold text-[var(--foreground)]",
              eyebrow && "mt-2",
            )}
          >
            {Icon ? (
              <Icon className="h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            ) : null}
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}

export default PageHeader;
