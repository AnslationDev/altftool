import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Shared header for every page in the module.
 *
 * The visible breadcrumb mirrors the BreadcrumbList JSON-LD exactly. Keeping
 * them in one component is what stops the two from drifting when a page's
 * position in the hierarchy changes later.
 */
export default function PageHeader({
  crumbs = [],
  eyebrow,
  title,
  lede,
  meta,
  children,
  toned,
}) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {crumbs.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {crumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />
                  ) : null}
                  {index === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-foreground">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="underline-offset-4 transition hover:text-foreground hover:underline"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? (
            <p
              className="rh-eyebrow mb-2"
              style={toned ? { color: "var(--rh-hue)" } : undefined}
            >
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>

          {lede ? (
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {lede}
            </p>
          ) : null}

          {meta ? <div className="mt-5">{meta}</div> : null}
        </div>

        {children}
      </div>
    </header>
  );
}
