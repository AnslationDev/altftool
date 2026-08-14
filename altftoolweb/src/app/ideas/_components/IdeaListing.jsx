import Link from "next/link";
import IdeaCard from "./IdeaCard";

/*
 * Shared listing shell for browse, verticals, and collections.
 *
 * Every listing follows the same page grammar so the product reads as one
 * system: breadcrumb → answer-first intro → stat strip → grid → pagination
 * → related links. The answer-first block is deliberately the first prose on
 * the page because it is the chunk generative engines lift.
 */
export default function IdeaListing({
  breadcrumb = [],
  eyebrow,
  title,
  answer,
  stats = [],
  ideas = [],
  total = 0,
  page = 1,
  perPage = 24,
  basePath,
  relatedTitle,
  related = [],
  children,
}) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {breadcrumb.length > 0 ? (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.name} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden="true" className="opacity-40">
                  /
                </span>
              ) : null}
              {crumb.path ? (
                <Link href={crumb.path} className="hover:text-primary">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <header className="border-b border-border pb-8">
        {eyebrow ? (
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        {answer ? (
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {answer}
          </p>
        ) : null}

        {stats.length > 0 ? (
          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">
                  {stat.value}
                </dd>
                <dt className="mt-0.5 text-xs text-muted-foreground">{stat.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      {children}

      <section className="py-8">
        {ideas.length === 0 ? (
          <div className="rounded-lg border border-border bg-canvas p-10 text-center">
            <p className="text-foreground">No ideas match this combination yet.</p>
            <Link href="/ideas/browse" className="mt-2 inline-block text-sm text-primary hover:underline">
              Clear the filters →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, i) => (
              <IdeaCard key={idea.slug} idea={idea} rank={(page - 1) * perPage + i + 1} />
            ))}
          </div>
        )}

        {lastPage > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6"
          >
            {page > 1 ? (
              <Link
                href={`${basePath}${basePath.includes("?") ? "&" : "?"}page=${page - 1}`}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-surface-soft"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="font-mono text-xs text-muted-foreground">
              Page {page.toLocaleString("en-US")} of {lastPage.toLocaleString("en-US")}
            </span>
            {page < lastPage ? (
              <Link
                href={`${basePath}${basePath.includes("?") ? "&" : "?"}page=${page + 1}`}
                className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-surface-soft"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            {relatedTitle}
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                {item.name}
                {item.count != null ? <span className="ml-1.5 opacity-50">{item.count}</span> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
