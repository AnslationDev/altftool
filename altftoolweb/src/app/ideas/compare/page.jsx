import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SIGNALS,
  tierOf,
  formatUsd,
  EFFORT_LABELS,
  derivedBadges,
} from "@altftool/core/ideas";
import { getIdeasBySlugs, getShard } from "@altftool/core/ideas/corpus";
import ScoreRing from "../_components/ScoreRing";

export const revalidate = 86400;

const MAX = 4;

const description =
  "Put up to four startup ideas side by side — all six signals, market size, contract value, startup cost and build effort in one table.";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const ids = String(params?.ids ?? "").split(",").filter(Boolean).slice(0, MAX);

  return createPageMetadata({
    title: "Compare startup ideas side by side",
    description,
    path: "/ideas/compare",
    keywords: ["compare startup ideas", "startup idea comparison", "which startup idea to build"],
    // A comparison of an arbitrary user-chosen set is not a page worth indexing;
    // the empty picker state is. (Helper takes noindex/follow booleans.)
    noindex: ids.length > 0,
    follow: true,
  });
}

/**
 * Indices holding the best value in a row, so the table is scannable.
 * Returns a Set because ties are common and marking only the first one
 * would claim a winner that does not exist. An all-way tie marks nothing —
 * the point of the table is the differences.
 */
function bestIndices(values, higherIsBetter = true) {
  const best = values.reduce((a, b) => (higherIsBetter ? Math.max(a, b) : Math.min(a, b)));
  const winners = new Set();
  values.forEach((v, i) => {
    if (v === best) winners.add(i);
  });
  return winners.size === values.length ? new Set() : winners;
}

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const slugs = String(params?.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX);

  const ideas = slugs.length ? await getIdeasBySlugs(slugs) : [];
  const suggestions = ideas.length ? [] : (await getShard(0)).slice(0, 8);

  return (
    <>
      <JsonLd
        id="altf-ideas-compare"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/compare", name: "Compare startup ideas", description }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Compare", path: "/ideas/compare" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Compare</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Side by side
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Compare up to four ideas
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            Scores are only meaningful next to alternatives. This puts every signal, every market
            figure, and every cost estimate in one table so the trade-off is explicit rather than
            remembered across tabs.
          </p>
        </header>

        {ideas.length === 0 ? (
          <section className="py-8">
            <div className="rounded-lg border border-dashed border-border bg-canvas p-8 text-center">
              <p className="text-foreground">Nothing selected yet.</p>
              <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Add ideas by passing their slugs, for example{" "}
                <code className="rounded-sm bg-surface-soft px-1.5 py-0.5 font-mono text-xs text-foreground">
                  /ideas/compare?ids=slug-one,slug-two
                </code>
                , or start from the highest-scoring ideas below.
              </p>
            </div>

            <h2 className="mb-4 mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              Try comparing these
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((idea) => (
                <Link
                  key={idea.slug}
                  href={`/ideas/compare?ids=${suggestions.slice(0, 3).map((s) => s.slug).join(",")}`}
                  className="rounded-sm border border-border bg-surface-soft px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
                >
                  {idea.title}
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="py-8">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Side-by-side comparison of {ideas.length} startup ideas
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 min-w-[9rem] bg-canvas px-3.5 py-4 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                      Idea
                    </th>
                    {ideas.map((idea) => (
                      <th key={idea.slug} scope="col" className="min-w-[15rem] border-l border-border bg-canvas px-3.5 py-4 text-left align-top">
                        <span className="flex items-start gap-3">
                          <ScoreRing scores={idea.scores} aos={idea.aos} size="sm" />
                          <span>
                            <Link
                              href={`/ideas/idea/${idea.slug}`}
                              className="text-[0.9375rem] font-semibold leading-snug text-foreground hover:text-primary"
                            >
                              {idea.title}
                            </Link>
                            <span className="mt-1 block font-mono text-[0.6875rem]" style={{ color: `var(${tierOf(idea.aos).cssVar})` }}>
                              Tier {tierOf(idea.aos).name}
                            </span>
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIGNALS.map((signal) => {
                    const values = ideas.map((i) => i.scores[signal.key]);
                    const winners = bestIndices(values);
                    return (
                      <tr key={signal.key} className="border-t border-border">
                        <th scope="row" className="sticky left-0 z-10 bg-canvas px-3.5 py-3 text-left font-normal">
                          <span className="flex items-center gap-2">
                            <span className="block h-2 w-2 shrink-0 rounded-sm" style={{ background: `var(${signal.cssVar})` }} />
                            <span className="text-muted-foreground">{signal.label}</span>
                          </span>
                        </th>
                        {values.map((v, i) => (
                          <td key={ideas[i].slug} className="border-l border-border px-3.5 py-3">
                            <span className="flex items-center gap-2.5">
                              <span className="afi-signal-row__track w-16">
                                <span className="afi-signal-row__fill" style={{ background: `var(${signal.cssVar})`, width: `${v}%` }} />
                              </span>
                              <span className={`font-mono tabular-nums ${winners.has(i) ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                {v}
                              </span>
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {[
                    ["Opportunity score", ideas.map((i) => i.aos), (v) => `${v}/100`, true],
                    ["Market size", ideas.map((i) => i.market.tamUsd), formatUsd, true],
                    ["Growth", ideas.map((i) => i.market.cagrPct), (v) => `${v}%`, true],
                    ["Contract value", ideas.map((i) => i.money.acvHighUsd), formatUsd, true],
                    ["Startup cost", ideas.map((i) => i.money.startupCostLowUsd), formatUsd, false],
                    ["Days to revenue", ideas.map((i) => i.money.timeToFirstRevenueDays), (v) => `${v}`, false],
                  ].map(([label, values, fmt, higher]) => {
                    const winners = bestIndices(values, higher);
                    return (
                      <tr key={label} className="border-t border-border">
                        <th scope="row" className="sticky left-0 z-10 bg-canvas px-3.5 py-3 text-left font-normal text-muted-foreground">
                          {label}
                        </th>
                        {values.map((v, i) => (
                          <td key={ideas[i].slug} className={`border-l border-border px-3.5 py-3 font-mono tabular-nums ${winners.has(i) ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {[
                    ["Industry", (i) => i.dna.vertical],
                    ["Buyer", (i) => i.dna.buyer],
                    ["Mechanism", (i) => i.dna.mechanism],
                    ["Model", (i) => i.money.pricingModel],
                    ["Effort", (i) => EFFORT_LABELS[i.build.effort]],
                    ["Confidence", (i) => i.confidence],
                  ].map(([label, get]) => (
                    <tr key={label} className="border-t border-border">
                      <th scope="row" className="sticky left-0 z-10 bg-canvas px-3.5 py-3 text-left font-normal text-muted-foreground">
                        {label}
                      </th>
                      {ideas.map((idea) => (
                        <td key={idea.slug} className="border-l border-border px-3.5 py-3 text-foreground">
                          {get(idea)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-t border-border">
                    <th scope="row" className="sticky left-0 z-10 bg-canvas px-3.5 py-3 text-left font-normal align-top text-muted-foreground">
                      Badges
                    </th>
                    {ideas.map((idea) => (
                      <td key={idea.slug} className="border-l border-border px-3.5 py-3">
                        <span className="flex flex-wrap gap-1.5">
                          {derivedBadges(idea.scores).map((b) => (
                            <span key={b.id} className="rounded-sm border border-primary/30 bg-primary-soft px-2 py-0.5 font-mono text-[0.6875rem] text-primary">
                              {b.label}
                            </span>
                          ))}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-border">
                    <th scope="row" className="sticky left-0 z-10 bg-canvas px-3.5 py-3 text-left font-normal align-top text-muted-foreground">
                      Hardest part
                    </th>
                    {ideas.map((idea) => (
                      <td key={idea.slug} className="border-l border-border px-3.5 py-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                        {idea.build.hardestPart}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bold marks the best value in each row. A row where every idea ties is left unmarked —
              the point is the differences, not a scoreboard.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
