import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  Gamepad2,
  Grid2X2,
  LayoutGrid,
  Package,
  Puzzle,
  Search,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

const POPULAR_SEARCHES = [
  "PDF",
  "Image",
  "Calculator",
  "AI",
  "JSON",
  "Business",
  "n8n",
  "Deals",
];

const STARTING_POINTS = [
  {
    title: "Tools & calculators",
    description: "Utilities for files, text, images, finance, health, and development.",
    href: "/tools/all",
    icon: Wrench,
  },
  {
    title: "Products",
    description: "AltFTool workspaces for ideas, security, domains, careers, and automation.",
    href: "/products",
    icon: Package,
  },
  {
    title: "Automation workflows",
    description: "Production-ready n8n templates organized by use case and technology.",
    href: "/n8n",
    icon: Workflow,
  },
  {
    title: "Business services",
    description: "Housing, insurance, loans, travel, legal, pet, and senior-care routes.",
    href: "/bops",
    icon: BriefcaseBusiness,
  },
  {
    title: "Guides & learning",
    description: "Blogs, academy resources, news, prompts, and practical explainers.",
    href: "/blogs",
    icon: BookOpen,
  },
  {
    title: "Deals & buying guides",
    description: "Offers, product research, brand ratings, and ranked recommendations.",
    href: "/deals",
    icon: ShoppingBag,
  },
];

const GROUP_ICONS = {
  platform: LayoutGrid,
  tools: Wrench,
  learn: BookOpen,
  commerce: ShoppingBag,
  experiences: Gamepad2,
  business: BriefcaseBusiness,
  support: CircleHelp,
  other: Grid2X2,
};

const TYPE_ICONS = {
  Tool: Wrench,
  "Tool category": LayoutGrid,
  Workflow,
  Guide: BookOpen,
  Extension: Puzzle,
  App: Smartphone,
  Product: Package,
  Signal: TrendingUp,
  "Business service": BriefcaseBusiness,
  Shopping: ShoppingBag,
  Experience: Gamepad2,
};

function searchHref(term) {
  return `/search?q=${encodeURIComponent(term)}`;
}

function SearchForm({ query }) {
  return (
    <form action="/search" className="mt-6 flex w-full flex-col gap-2 sm:flex-row" role="search">
      <div className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor="global-search-input">
          Search all AltFTool pages
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          autoComplete="off"
          autoFocus
          className="h-13 w-full rounded-md border border-border bg-card pl-12 pr-12 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
          defaultValue={query}
          id="global-search-input"
          maxLength={100}
          minLength={2}
          name="q"
          placeholder="Search tools, workflows, products, guides, services..."
          role="searchbox"
          spellCheck={false}
          type="text"
        />
        {query ? (
          <Link
            aria-label="Clear global search"
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            href="/search"
            title="Clear search"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <button
        className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        type="submit"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        Search
      </button>
    </form>
  );
}

function ResultCard({ item }) {
  const Icon = TYPE_ICONS[item.type] || FileText;

  return (
    <li>
      <Link
        className="group flex h-full min-h-36 gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
        href={item.path}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0 text-base font-semibold leading-6 text-foreground group-hover:text-primary">
              {item.label}
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary"
            />
          </span>
          <span className="mt-1 block line-clamp-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </span>
          <span className="mt-3 flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-foreground">
              {item.type}
            </span>
            <span className="min-w-0 truncate text-xs text-muted-foreground">{item.path}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function ResultGroup({ group, query }) {
  const Icon = GROUP_ICONS[group.id] || Grid2X2;

  return (
    <section aria-labelledby={`search-group-${group.id}`} id={`search-group-${group.id}`}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground" id={`search-group-${group.id}`}>
              {group.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {group.total.toLocaleString()} match{group.total === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        {group.hasMore ? (
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-primary transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            href={`/site-map?q=${encodeURIComponent(query)}`}
          >
            Browse all
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {group.items.map((item) => (
          <ResultCard item={item} key={item.path} />
        ))}
      </ul>
    </section>
  );
}

export default function SearchContent({ query = "", searchResult = null }) {
  const trimmedQuery = query.trim();
  const isValid = trimmedQuery.length >= 2;
  const hasResults = Boolean(searchResult?.total);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="transition hover:text-primary" href="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Search</span>
          </nav>

          <div className="mt-5 max-w-3xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
              <Search aria-hidden="true" className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Search all of AltFTool</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Find tools, workflows, products, extensions, guides, deals, services, and public pages
              from one global search.
            </p>
          </div>

          <SearchForm query={trimmedQuery} />

          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Popular searches">
            <span className="mr-1 text-xs font-semibold uppercase text-muted-foreground">Popular</span>
            {POPULAR_SEARCHES.map((term) => (
              <Link
                className="inline-flex min-h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                href={searchHref(term)}
                key={term}
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {!isValid ? (
          <>
            {trimmedQuery ? (
              <div
                className="mb-6 rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
                role="status"
              >
                Type at least 2 characters to search across AltFTool.
              </div>
            ) : null}

            <section aria-labelledby="search-starting-points">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold" id="search-starting-points">
                    Browse popular areas
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Start with a directory or search for a specific task above.
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-primary transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  href="/site-map"
                >
                  View complete site map
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>

              <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {STARTING_POINTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        className="group flex h-full min-h-32 gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                        href={item.href}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-base font-semibold group-hover:text-primary">
                            {item.title}
                            <ArrowRight
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
                            />
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        ) : (
          <>
            <section aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {hasResults ? (
                    <>
                      {searchResult.total.toLocaleString()} result
                      {searchResult.total === 1 ? "" : "s"} for &quot;{trimmedQuery}&quot;
                    </>
                  ) : (
                    <>No results for &quot;{trimmedQuery}&quot;</>
                  )}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchResult
                    ? `Searched ${searchResult.searchedRoutes.toLocaleString()} public AltFTool routes.`
                    : "Try a shorter keyword or a related term."}
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                href="/site-map"
              >
                <Grid2X2 aria-hidden="true" className="h-4 w-4" />
                Complete site map
              </Link>
            </section>

            {hasResults ? (
              <>
                <nav
                  aria-label="Search result categories"
                  className="mt-5 flex gap-2 overflow-x-auto pb-2"
                >
                  {searchResult.groups.map((group) => (
                    <a
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      href={`#search-group-${group.id}`}
                      key={group.id}
                    >
                      {group.title}
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
                        {group.total}
                      </span>
                    </a>
                  ))}
                </nav>

                <div className="mt-8 space-y-10">
                  {searchResult.groups.map((group) => (
                    <ResultGroup group={group} key={group.id} query={trimmedQuery} />
                  ))}
                </div>
              </>
            ) : (
              <section className="mt-8 rounded-lg border border-border bg-card p-6 text-center shadow-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
                  <Search aria-hidden="true" className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Try another search</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Search by task, file type, product, category, service, workflow node, or route name.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
