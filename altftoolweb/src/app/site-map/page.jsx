import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileCode2,
  FolderTree,
  Gamepad2,
  LayoutGrid,
  Search,
  ShoppingBag,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  EXPERIENCE_ROUTE_OPTIONS,
  PRODUCT_SUITE_ROUTE_OPTIONS,
  SITE_ROUTES,
  TOOL_CATEGORY_ROUTE_OPTIONS,
} from "@/platform/navigation/siteRoutes";
import { getSitemapEntries } from "../sitemap";
import { buildSiteMapGroups } from "./siteMapData";

export const revalidate = 3600;

export const metadata = createPageMetadata({
  title: "Site Map - Explore Every AltFTool Page",
  description:
    "Browse every public AltFTool route by category, including tools, products, blogs, news, deals, games, services, and support pages.",
  path: "/site-map",
  keywords: ["AltFTool site map", "AltFTool pages", "all online tools", "website directory"],
});

const PAGE_SIZE = 72;
const CATEGORY_SAMPLE_SIZE = 6;

const GROUP_ICONS = {
  platform: LayoutGrid,
  tools: Wrench,
  automation: Workflow,
  learn: BookOpen,
  commerce: ShoppingBag,
  experiences: Gamepad2,
  business: BriefcaseBusiness,
  support: CircleHelp,
  other: FolderTree,
};

function createKnownLabels() {
  const labels = new Map([["/", "AltFTool home"]]);

  for (const route of Object.values(SITE_ROUTES)) {
    if (route?.href && route?.label) labels.set(route.href, route.label);
  }

  for (const route of [
    ...PRODUCT_SUITE_ROUTE_OPTIONS,
    ...EXPERIENCE_ROUTE_OPTIONS,
    ...TOOL_CATEGORY_ROUTE_OPTIONS,
  ]) {
    labels.set(route.href, route.label);
  }

  for (const [slug, tool] of Object.entries(toolMetaMap)) {
    labels.set(`/tools/all/${slug}`, tool.name || slug);
  }

  return labels;
}

function directoryHref({ category, page, query } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/site-map?${suffix}` : "/site-map";
}

function paginationItems(currentPage, totalPages) {
  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page > 0 && page <= totalPages) pages.add(page);
  }
  return [...pages].sort((left, right) => left - right);
}

function RouteList({ groupTitles, routes }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((route) => (
        <li key={route.path}>
          <Link
            className="group flex min-h-16 items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            href={route.path}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                {route.label}
              </span>
              <span className="mt-0.5 block break-all text-xs leading-5 text-muted-foreground">
                {groupTitles.get(route.groupId)} · {route.path}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Pagination({ category, currentPage, query, totalPages }) {
  if (totalPages <= 1) return null;
  const pages = paginationItems(currentPage, totalPages);

  return (
    <nav aria-label="Site map pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Link
        aria-disabled={currentPage === 1}
        className={`inline-flex h-10 items-center gap-1 rounded-md border border-border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${
          currentPage === 1
            ? "pointer-events-none opacity-50"
            : "hover:border-primary hover:text-primary"
        }`}
        href={directoryHref({ category, query, page: Math.max(1, currentPage - 1) })}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Previous
      </Link>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        return (
          <span className="contents" key={page}>
            {previous && page - previous > 1 ? (
              <span aria-hidden="true" className="px-1 text-muted-foreground">
                …
              </span>
            ) : null}
            <Link
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
              className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${
                page === currentPage
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary hover:text-primary"
              }`}
              href={directoryHref({ category, query, page })}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        aria-disabled={currentPage === totalPages}
        className={`inline-flex h-10 items-center gap-1 rounded-md border border-border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${
          currentPage === totalPages
            ? "pointer-events-none opacity-50"
            : "hover:border-primary hover:text-primary"
        }`}
        href={directoryHref({ category, query, page: Math.min(totalPages, currentPage + 1) })}
      >
        Next
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </nav>
  );
}

function CategoryOverview({ groups }) {
  return (
    <section aria-labelledby="site-map-categories" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold" id="site-map-categories">
            Browse by category
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a category to browse every route in lightweight pages.
          </p>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.id] || FolderTree;
          return (
            <article className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 shadow-sm" key={group.id}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">{group.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.routes.length.toLocaleString()} routes
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border border-y border-border">
                {group.routes.slice(0, CATEGORY_SAMPLE_SIZE).map((route) => (
                  <li key={route.path}>
                    <Link
                      className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm font-medium transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      href={route.path}
                    >
                      <span className="min-w-0 truncate">{route.label}</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                href={directoryHref({ category: group.id })}
              >
                Browse all {group.routes.length.toLocaleString()}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default async function SiteMapPage({ searchParams }) {
  const params = await searchParams;
  const query = String(params?.q || "").trim().slice(0, 100);
  const requestedCategory = String(params?.category || "").trim();
  const requestedPage = Number.parseInt(String(params?.page || "1"), 10);
  const entries = await getSitemapEntries();
  const labels = createKnownLabels();
  const allGroups = buildSiteMapGroups(entries, { labels });
  const selectedGroup = allGroups.find((group) => group.id === requestedCategory) || null;
  const resultGroups = query
    ? buildSiteMapGroups(entries, { labels, query })
    : selectedGroup
      ? [selectedGroup]
      : [];
  const resultRoutes = resultGroups.flatMap((group) => group.routes);
  const totalRoutes = allGroups.reduce((total, group) => total + group.routes.length, 0);
  const totalPages = Math.max(1, Math.ceil(resultRoutes.length / PAGE_SIZE));
  const currentPage = Math.min(
    totalPages,
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  );
  const visibleRoutes = resultRoutes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const groupTitles = new Map(allGroups.map((group) => [group.id, group.title]));
  const resultTitle = query ? "Search results" : selectedGroup?.title;

  return (
    <main className="bg-background text-foreground">
      <JsonLd
        id="site-map-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/site-map",
            name: "AltFTool Site Map",
            description: "A category-based directory of every public AltFTool page.",
          }),
          createItemListJsonLd({
            path: "/site-map",
            name: "AltFTool route categories",
            items: allGroups.map((group) => ({
              name: group.title,
              path: directoryHref({ category: group.id }),
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Site Map", path: "/site-map" },
          ]),
        ]}
      />

      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link className="transition hover:text-primary" href="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Site Map</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
              <FolderTree aria-hidden="true" className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Explore every AltFTool page</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Find tools, products, guides, deals, games, services, and company resources from one
              structured directory. This page stays synchronized with our canonical XML sitemap.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 font-medium">
              <FolderTree aria-hidden="true" className="h-4 w-4 text-primary" />
              {totalRoutes.toLocaleString()} public routes
            </span>
            <span className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 font-medium">
              {allGroups.length} categories
            </span>
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 font-semibold transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              href="/sitemap.xml"
            >
              <FileCode2 aria-hidden="true" className="h-4 w-4" />
              XML sitemap
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="site-map-directory" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="sr-only" id="site-map-directory">
          Route directory
        </h2>

        <form action="/site-map" className="flex flex-col gap-2 sm:flex-row" role="search">
          <label className="relative min-w-0 flex-1" htmlFor="site-map-search">
            <span className="sr-only">Search all AltFTool pages</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
              defaultValue={query}
              id="site-map-search"
              maxLength={100}
              name="q"
              placeholder="Search tools, pages, categories, or routes..."
              type="search"
            />
            {query ? (
              <Link
                aria-label="Clear site map search"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                href="/site-map"
                title="Clear search"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : null}
          </label>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-primary"
            type="submit"
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            Search
          </button>
        </form>

        <nav aria-label="Site map categories" className="mt-5 flex flex-wrap gap-2">
          <Link
            aria-current={!query && !selectedGroup ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary ${
              !query && !selectedGroup
                ? "border-primary bg-muted text-primary"
                : "border-border bg-card hover:border-primary hover:text-primary"
            }`}
            href="/site-map"
          >
            All categories
          </Link>
          {allGroups.map((group) => (
            <Link
              aria-current={!query && selectedGroup?.id === group.id ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary ${
                !query && selectedGroup?.id === group.id
                  ? "border-primary bg-muted text-primary"
                  : "border-border bg-card hover:border-primary hover:text-primary"
              }`}
              href={directoryHref({ category: group.id })}
              key={group.id}
            >
              {group.title}
              <span className="ml-2 text-xs text-muted-foreground">{group.routes.length}</span>
            </Link>
          ))}
        </nav>

        {!query && !selectedGroup ? <CategoryOverview groups={allGroups} /> : null}

        {query || selectedGroup ? (
          <section aria-labelledby="site-map-results" className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold" id="site-map-results">
                  {resultTitle}
                </h2>
                <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
                  {resultRoutes.length.toLocaleString()} routes
                  {query ? (
                    <>
                      {" "}matching <strong className="text-foreground">“{query}”</strong>
                    </>
                  ) : null}
                </p>
              </div>
              <Link
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                href="/site-map"
              >
                <LayoutGrid aria-hidden="true" className="h-4 w-4" />
                All categories
              </Link>
            </div>

            {visibleRoutes.length ? (
              <div className="mt-5">
                <RouteList groupTitles={groupTitles} routes={visibleRoutes} />
                <Pagination
                  category={query ? undefined : selectedGroup?.id}
                  currentPage={currentPage}
                  query={query || undefined}
                  totalPages={totalPages}
                />
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-border bg-card px-5 py-10 text-center">
                <Search aria-hidden="true" className="mx-auto h-6 w-6 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-semibold">No matching pages</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another tool name, category, or route path.
                </p>
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  href="/site-map"
                >
                  View all categories
                </Link>
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
