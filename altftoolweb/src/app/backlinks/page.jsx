import Link from "next/link";
import { ArrowUpRight, LayoutList, Search, Table2 } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getManifest, queryItems } from "@altftool/core/backlinks";
import FilterRail from "./_components/FilterRail";
import OpportunityRow from "./_components/OpportunityRow";
import ImpactBadge from "./_components/ImpactBadge";
import SheetView from "./_components/SheetView";
import FloorBand from "@/app/(marketing)/components/floor/FloorBand";
import { BACKLINKS_SCENE } from "@/app/(marketing)/components/floor/scenes";

export const revalidate = 21600;

const PER_PAGE = 30;
// The sheet exists to show more at once, so it pages in bigger chunks.
const SHEET_PER_PAGE = 100;

const description =
  "A working list of places to submit a product for backlinks and discovery — launch platforms, tool directories, AI listings, marketplaces and registries. Filter by cost, effort and priority, then open the submit page in one click.";

const FAQS = [
  {
    question: "Do backlinks still matter for ranking in 2026?",
    answer:
      "Links remain one signal among many, and low-quality bulk links do more harm than good. What still works is being listed where your buyers actually look — directories with real traffic, registries your peers use, and launch platforms with engaged audiences. Every entry in this list is a place a human might plausibly find you, which is why they are worth submitting to regardless of link equity.",
  },
  {
    question: "Which submissions should I do first?",
    answer:
      "Start with the quick wins filter: free, low effort, and high priority. Those are the entries where a single form submission gets you a live listing the same week. Launch platforms are worth saving until your product is genuinely ready, because you only get one good attempt at each.",
  },
  {
    question: "How is the impact score calculated?",
    answer:
      "It starts from a hand-assigned priority band (do first, high, medium, later), then adjusts for cost and effort. A free, quick opportunity scores above a paid, involved one in the same band, because it is the one you can realistically finish today. The score is a queueing aid, not a measure of domain authority.",
  },
  {
    question: "Are these links free?",
    answer:
      "Most are. Of the entries in this list, the majority are free to submit to or offer a free tier that includes a listing. Cost is shown on every row, and you can filter to only the ones with no paid requirement.",
  },
  {
    question: "Will submitting everywhere hurt my site?",
    answer:
      "Submitting to spam directories can. That is why this list is curated rather than scraped, and why entries carry a status showing whether they have been verified as live. Skip anything that promises hundreds of links for a fee, and prefer places where a real person reviews submissions.",
  },
];

export async function generateMetadata() {
  const manifest = await getManifest();
  return createPageMetadata({
    title: `${manifest.total} places to submit your product for backlinks`,
    description,
    path: "/backlinks",
    keywords: [
      "backlink sites list",
      "where to submit my startup",
      "free directory submission sites",
      "product launch platforms",
      "AI tool directories",
      "SaaS directory list",
    ],
  });
}

function Stat({ value, label }) {
  return (
    <div>
      <dd className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

export default async function BacklinksPage({ searchParams }) {
  const sp = (await searchParams) ?? {};
  const current = {
    group: sp.group ?? "",
    cost: sp.cost ?? "",
    status: sp.status ?? "",
    priority: sp.priority ?? "",
    effort: sp.effort ?? "",
    q: sp.q ?? "",
    freeOnly: sp.freeOnly ?? "",
    quickWins: sp.quickWins ?? "",
    sort: sp.sort ?? "",
    // Sheet view is a URL state, not component state: it survives refresh,
    // is shareable, and stays server-rendered for crawlers.
    view: sp.view === "sheet" ? "sheet" : "",
  };
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [manifest, result, startHere] = await Promise.all([
    getManifest(),
    queryItems({
      ...current,
      page,
      perPage: current.view === "sheet" ? SHEET_PER_PAGE : PER_PAGE,
      sort: current.sort || "impact",
    }),
    queryItems({ quickWins: true, perPage: 6, sort: "impact" }),
  ]);

  const filtered = Boolean(
    current.group || current.cost || current.status || current.priority || current.effort || current.q || current.freeOnly || current.quickWins,
  );

  // Shown on the collapsed mobile summary, so an active filter is never hidden
  // behind a closed <details>.
  const activeFilterCount = ["group", "cost", "status", "priority", "effort", "freeOnly", "quickWins"]
    .filter((k) => current[k]).length;

  const groupLabels = Object.fromEntries(manifest.groups.map((g) => [g.id, g.label]));

  const qs = (over) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...over })) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/backlinks?${s}` : "/backlinks";
  };

  return (
    <>
      <JsonLd
        id="altf-backlinks-schema"
        data={[
          createCollectionPageJsonLd({ path: "/backlinks", name: "AltF Backlinks", description }),
          createItemListJsonLd({
            path: "/backlinks",
            name: "Places to submit your product for backlinks",
            items: result.rows.map((i) => ({ name: i.website, path: `/backlinks/${i.slug}` })),
          }),
          createFaqJsonLd({ path: "/backlinks", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Backlinks", path: "/backlinks" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ---------- header ---------- */}
        <header className="border-b border-border pb-8 pt-6">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            AltF Backlinks
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {manifest.total} places to submit your product
          </h1>

          {/* Answer-first paragraph: the chunk answer engines lift. */}
          <p className="mt-4 max-w-[68ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            A maintained list of {manifest.total} directories, launch platforms, registries and
            marketplaces that accept product submissions. {manifest.freeCount} of them are free or
            have a free tier, and {manifest.quickWins} are quick wins — free, low effort, and worth
            doing first. Every row shows cost, effort and priority, and links straight to the
            submission page.
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            <Stat value={manifest.total} label="Opportunities" />
            <Stat value={manifest.freeCount} label="Free or freemium" />
            <Stat value={manifest.quickWins} label="Quick wins" />
            <Stat value={manifest.groups.length} label="Categories" />
          </dl>
        </header>

        {/* ---------- start here ---------- */}
        {!filtered && startHere.rows.length > 0 ? (
          <section className="bl-start mt-8 p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Start here — six submissions you can finish today
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Free, low effort, high priority. No account debris, no paid tier.
                </p>
              </div>
              <Link href={qs({ quickWins: "1" })} className="text-sm font-medium text-primary hover:underline">
                See all {manifest.quickWins} quick wins →
              </Link>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {startHere.rows.map((item) => (
                <li key={item.slug} className="bl-row !p-3.5">
                  <ImpactBadge impact={item.impact} size={38} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      <Link href={`/backlinks/${item.slug}`} className="hover:text-primary">
                        {item.website}
                      </Link>
                    </h3>
                    <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                      {item.domain}
                    </p>
                  </div>
                  <a
                    className="bl-open !h-8 !px-2.5 !text-xs shrink-0"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                  >
                    Go
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">{item.website} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- body ---------- */}
        <div className="grid items-start gap-8 py-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
          <div className="lg:sticky lg:top-20">
            <details className="bl-filter-collapse">
              <summary className="bl-filter-summary">
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </summary>
              <div className="bl-filter-body">
                <FilterRail
                  current={current}
                  facets={manifest.facets}
                  groups={manifest.groups}
                  counts={{ quickWins: manifest.quickWins, freeCount: manifest.freeCount }}
                />
              </div>
            </details>
          </div>

          <div className="min-w-0">
            <form action="/backlinks" className="mb-4 flex gap-2">
              {Object.entries(current).map(([k, v]) =>
                v && k !== "q" ? <input key={k} type="hidden" name={k} value={v} /> : null,
              )}
              <div className="flex h-11 flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <label className="sr-only" htmlFor="bl-q">
                  Search by site name, domain or category
                </label>
                <input
                  id="bl-q"
                  name="q"
                  type="search"
                  defaultValue={current.q}
                  placeholder="Search 661 sites by name, domain or category…"
                  className="h-10 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Search
              </button>
            </form>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="font-mono tabular-nums text-foreground">{result.total}</strong>{" "}
                  {result.total === 1 ? "opportunity" : "opportunities"}
                  {filtered ? " matching your filters" : ""}
                </p>
                {/* One click between reading and working. Both are real URLs. */}
                <nav className="bl-view" aria-label="View">
                  <Link
                    href={qs({ view: "", page: "" })}
                    aria-current={current.view === "sheet" ? undefined : "page"}
                    scroll={false}
                  >
                    <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
                    Cards
                  </Link>
                  <Link
                    href={qs({ view: "sheet", page: "" })}
                    aria-current={current.view === "sheet" ? "page" : undefined}
                    scroll={false}
                  >
                    <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Sheet
                  </Link>
                </nav>
              </div>
              <nav
                className={`flex items-center gap-1 text-xs ${current.view === "sheet" ? "hidden" : ""}`}
                aria-label="Sort"
              >
                <span className="text-muted-foreground">Sort</span>
                {[
                  ["impact", "Impact"],
                  ["effort", "Easiest"],
                  ["name", "A–Z"],
                ].map(([id, label]) => (
                  <Link
                    key={id}
                    href={qs({ sort: id === "impact" ? "" : id, page: "" })}
                    className="bl-facet !px-2 !py-1"
                    aria-current={(current.sort || "impact") === id ? "true" : undefined}
                    scroll={false}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {result.rows.length === 0 ? (
              <div className="rounded-lg border border-border bg-canvas p-10 text-center">
                <p className="text-foreground">Nothing matches that combination.</p>
                <Link href="/backlinks" className="mt-2 inline-block text-sm text-primary hover:underline">
                  Clear the filters →
                </Link>
              </div>
            ) : current.view === "sheet" ? (
              <SheetView
                rows={result.rows}
                groupLabels={groupLabels}
                current={current}
                buildHref={qs}
                startIndex={(result.page - 1) * result.perPage}
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {result.rows.map((item) => (
                  <OpportunityRow key={item.slug} item={item} showGroupLabel={!current.group} />
                ))}
              </ul>
            )}

            {result.lastPage > 1 ? (
              <nav
                className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5"
                aria-label="Pagination"
              >
                {result.page > 1 ? (
                  <Link
                    href={qs({ page: String(result.page - 1) })}
                    className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-soft"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  Page {result.page} of {result.lastPage}
                </span>
                {result.page < result.lastPage ? (
                  <Link
                    href={qs({ page: String(result.page + 1) })}
                    className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-soft"
                  >
                    Next →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </div>
        </div>

        {/* ---------- categories ---------- */}
        <FloorBand
          scene={BACKLINKS_SCENE}
          kicker="Behind the list"
          title="A link opportunity is not a link."
          body="Every row here starts as a line in a sheet, gets normalised into one of 14 groups, scored for cost, effort and impact, and written up with the steps to actually submit. The floor below is that pipeline, running."
          href="/backlinks?view=sheet"
          cta="Open the sheet view"
        />

        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Browse by category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {manifest.groups.map((g) => (
              <Link
                key={g.id}
                href={`/backlinks/category/${g.id}`}
                className="bl-row !block !p-4 hover:!border-primary"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{g.label}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {g.count}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="max-w-3xl">
            {FAQS.map((faq, i) => (
              <details key={faq.question} className="border-b border-border" open={i === 0}>
                <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
