import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowUpRight, BarChart3, CheckCircle2, Gauge, Globe2, HelpCircle, Info } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SIGNAL_CATALOG,
  SIGNAL_DATA_AS_OF,
  formatSearchVolume,
  getSignalBySlug,
} from "@altftool/core/signals";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import LiveTrendPanel from "./LiveTrendPanel";
import { COVERAGE_STATES, getSignalCoverage, isSignalIndexable } from "../signalCoverage";

export const dynamicParams = false;

function pathLabel(path) {
  if (path === "/altflovepdf") return "AltF PDF Studio";
  return path.split("/").filter(Boolean).pop().split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function generateStaticParams() {
  // Not gated behind shouldDeferBulkPrerendering(): dynamicParams is false, so
  // an empty list would 404 all 12 signals. No new routes are added here.
  return SIGNAL_CATALOG.map((signal) => ({ slug: signal.slug }));
}

/** Volume phrasing that stays honest when the catalogue has no estimate. */
function volumePhrase(signal) {
  return Number.isFinite(signal.searchVolume)
    ? `an estimated ${formatSearchVolume(signal.searchVolume)} monthly searches ${signal.region.toLowerCase()}`
    : "no published volume estimate";
}

/**
 * Answer-first sentence. It leads with the numbers a reader came for, states
 * that the opportunity score is AltFTool's own editorial estimate rather than
 * a measured metric, and then says outright whether AltFTool ships anything
 * for this demand. All figures come from the catalogue at render time.
 */
function buildAnswer(signal, coverage) {
  const opening = `AltF Signals rates "${signal.query}" at ${signal.opportunityScore} out of 100 on AltFTool's own editorial opportunity scale, against ${volumePhrase(signal)} and ${signal.competition.toLowerCase()} competition.`;
  return coverage ? `${opening} ${coverage.coverage}` : opening;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const signal = getSignalBySlug(slug);
  if (!signal) return {};
  const coverage = getSignalCoverage(slug);
  const indexable = isSignalIndexable(slug);
  return createPageMetadata({
    title: `${signal.name} Demand and Opportunity Research`,
    description: coverage ? coverage.coverage : signal.summary,
    path: `/signals/${signal.slug}`,
    keywords: [signal.query, `${signal.name} trend`, `${signal.name} market`],
    // A research page for a category AltFTool has not built cannot satisfy the
    // commercial query it names. It stays live for readers who arrive from
    // /signals, but it is kept out of the index; follow remains on so its
    // internal links still pass value.
    noindex: !indexable,
    follow: true,
  });
}

export default async function SignalDetailPage({ params }) {
  const { slug } = await params;
  const signal = getSignalBySlug(slug);
  if (!signal) notFound();
  const path = `/signals/${signal.slug}`;
  const coverage = getSignalCoverage(slug);
  const answer = buildAnswer(signal, coverage);
  const notBuilt = coverage?.state === "none";
  const moreFromAltftool = getRelatedContentForPreset(
    {
      href: path,
      title: signal.name,
      description: signal.summary,
      tags: [signal.category],
      section: "signals",
    },
    "utility",
  );

  return (
    <>
      <JsonLd
        id={`signal-${signal.slug}-schema`}
        data={[
          createCollectionPageJsonLd({ path, name: `${signal.name} research`, description: answer }),
          // FAQPage only where hand-written questions are rendered below, which
          // excludes the categories AltFTool has not built.
          coverage?.faqs?.length ? createFaqJsonLd({ path, questions: coverage.faqs }) : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Signals", path: "/signals" },
            { name: signal.name, path },
          ]),
        ]}
      />
      <main id="main-content" className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-surface-soft">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <Link href="/signals" className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All signals
            </Link>
            <div className="mt-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{signal.category}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">{signal.momentum}</span>
                {coverage ? (
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {COVERAGE_STATES[coverage.state]}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">{signal.name}</h1>
              {/* Answer-first: numbers, their provenance, and whether AltFTool
                  ships anything for this demand - quotable without the page. */}
              <p className="mt-4 text-base leading-7 text-foreground sm:text-lg">{answer}</p>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{signal.summary}</p>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4 text-primary" />Opportunity score</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{signal.opportunityScore}<span className="text-sm text-muted-foreground">/100</span></dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><BarChart3 className="h-4 w-4 text-primary" />Monthly search</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{formatSearchVolume(signal.searchVolume)}</dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">Competition</dt><dd className="mt-2 text-2xl font-semibold">{signal.competition}</dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Globe2 className="h-4 w-4 text-primary" />Coverage</dt><dd className="mt-2 text-2xl font-semibold">{signal.region}</dd></div>
            </dl>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="space-y-6">
            {notBuilt ? (
              <section className="rounded-lg border border-border bg-surface-soft p-5" aria-labelledby="not-built-title">
                <h2 id="not-built-title" className="flex items-center gap-2 text-xl font-semibold">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  Does AltFTool have a tool for &quot;{signal.query}&quot;?
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  No, and this page will not pretend otherwise. It is demand research for a category AltFTool has not
                  built: the requirements listed below describe what a credible product would have to do, not something
                  you can use here and not a commitment to build it. Because the page cannot answer the query it names,
                  it is deliberately excluded from search indexing.
                </p>
              </section>
            ) : null}

            <LiveTrendPanel query={signal.query} />

            <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="blueprint-title">
              <p className="text-xs font-semibold uppercase text-primary">Opportunity blueprint</p>
              <h2 id="blueprint-title" className="mt-1 text-xl font-semibold">What would a strong product for &quot;{signal.query}&quot; have to solve?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {signal.actions.length} requirements, written as the jobs a credible product in this category has to
                do. They describe a target, not an AltFTool roadmap or a release commitment.
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {signal.actions.map((action) => (
                  <li key={action} className="flex items-start gap-3 rounded-md bg-surface-soft p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Methodology in the main column, not buried in an aside. An
                unexplained score is not citable; a scored-by-hand admission is. */}
            <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="method-title">
              <h2 id="method-title" className="flex items-center gap-2 text-xl font-semibold">
                <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                How are these numbers produced?
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Source and meaning of each figure on this page</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="py-2 pr-4 font-semibold">Figure</th>
                      <th scope="col" className="py-2 font-semibold">Where it comes from</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <th scope="row" className="py-2.5 pr-4 align-top font-semibold">Opportunity score</th>
                      <td className="py-2.5 align-top text-muted-foreground">AltFTool editorial judgement on a 0-100 scale. It is not measured, not audited and not a prediction of commercial success.</td>
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="py-2.5 pr-4 align-top font-semibold">Monthly search</th>
                      <td className="py-2.5 align-top text-muted-foreground">A directional third-party estimate where one is recorded. Where none is, the figure reads &quot;Researching&quot; rather than showing a made-up number.</td>
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="py-2.5 pr-4 align-top font-semibold">Competition and momentum</th>
                      <td className="py-2.5 align-top text-muted-foreground">Editorial labels, not metrics from an SEO platform.</td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2.5 pr-4 align-top font-semibold">Relative search interest</th>
                      <td className="py-2.5 align-top text-muted-foreground">The only live figure on this page. It is fetched from Google Trends when you load the page and is a 0-100 relative index, not absolute volume.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Snapshot last reviewed {SIGNAL_DATA_AS_OF}.
              </p>
            </section>

            {coverage?.faqs?.length ? (
              <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="signal-faq-title">
                <h2 id="signal-faq-title" className="flex items-center gap-2 text-xl font-semibold">
                  <HelpCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {signal.name}: questions and answers
                </h2>
                <dl className="mt-4 divide-y divide-border">
                  {coverage.faqs.map((faq) => (
                    <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                      <dt className="text-base font-semibold text-foreground">{faq.question}</dt>
                      <dd className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4" aria-label="Related signal information">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-semibold">Use related AltFTool products</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {notBuilt
                  ? "These are the nearest working tools. None of them does the job this page researches."
                  : "Move from research to a working utility."}
              </p>
              <div className="mt-4 space-y-2">
                {signal.relatedPaths.map((relatedPath) => (
                  <Link key={relatedPath} href={relatedPath} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm font-semibold transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {pathLabel(relatedPath)}
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface-soft p-5 text-sm leading-6 text-muted-foreground">
              <h2 className="font-semibold text-foreground">Research notes</h2>
              <p className="mt-2">Snapshot reviewed {SIGNAL_DATA_AS_OF}. Search volume is a directional estimate where available. Opportunity score is AltFTool editorial research, not a promise of commercial success.</p>
            </section>
          </aside>
        </div>

        <RelatedContentSection
          title="More from AltFTool"
          items={moreFromAltftool}
          path={path}
          jsonLdName={`More from AltFTool for ${signal.name}`}
        />
      </main>
    </>
  );
}
