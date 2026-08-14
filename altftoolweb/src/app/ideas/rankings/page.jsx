import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SIGNALS, tierOf, formatUsd, EFFORT_LABELS } from "@altftool/core/ideas";
import { getAllPublished, getManifest } from "@altftool/core/ideas/corpus";
import ScoreRing from "../_components/ScoreRing";
import { SignalBars } from "../_components/SignalBars";

export const revalidate = 86400;

/*
 * Leaderboards. IdeasAI's most effective hook is a set of time-sliced "top
 * ideas" lists, but theirs rank on votes, which measures how catchy a title is.
 * These rank on a signal instead, so each board answers a real question:
 * "what if I only cared about monetisation?"
 */

const BOARDS = [
  { slug: "overall", label: "Overall", blurb: "Ranked by the full weighted opportunity score.", key: null },
  ...SIGNALS.map((s) => ({
    slug: s.key === "money" ? "monetisation" : s.key === "competition" ? "open-field" : s.key,
    label: s.label,
    blurb: s.blurb,
    key: s.key,
  })),
];

const description =
  "Startup idea leaderboards ranked by each signal — highest demand, deepest moat, best monetisation, easiest to build, strongest timing, and most open field.";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const board = BOARDS.find((b) => b.slug === params?.by) ?? BOARDS[0];

  return createPageMetadata({
    title:
      board.key === null
        ? "Top startup ideas — the highest-scoring in the corpus"
        : `Top startup ideas by ${board.label.toLowerCase()}`,
    description,
    path: "/ideas/rankings",
    keywords: ["top startup ideas", "best startup ideas", "highest scoring startup ideas"],
  });
}

export default async function RankingsPage({ searchParams }) {
  const params = await searchParams;
  const board = BOARDS.find((b) => b.slug === params?.by) ?? BOARDS[0];

  const [all, manifest] = await Promise.all([getAllPublished(), getManifest()]);

  const ranked = [...all]
    .sort((a, b) => (board.key ? b.scores[board.key] - a.scores[board.key] : b.aos - a.aos))
    .slice(0, 50);

  return (
    <>
      <JsonLd
        id="altf-ideas-rankings"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/rankings", name: "Startup idea rankings", description }),
          createItemListJsonLd({
            path: "/ideas/rankings",
            name: `Top startup ideas by ${board.label.toLowerCase()}`,
            items: ranked.slice(0, 25).map((idea) => ({
              name: idea.title,
              path: `/ideas/idea/${idea.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Rankings", path: "/ideas/rankings" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Rankings</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Leaderboards
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {board.key === null ? "The highest-scoring ideas" : `Top ideas by ${board.label.toLowerCase()}`}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {board.blurb} Ranked across all {manifest.published.toLocaleString("en-US")}{" "}
            published ideas. Ranking on a single signal is deliberately lopsided — it answers &ldquo;what if I
            only cared about this one thing&rdquo;, which is a useful question precisely because it
            is not the whole picture.
          </p>
        </header>

        <nav aria-label="Leaderboards" className="flex flex-wrap gap-2 border-b border-border py-5">
          {BOARDS.map((b) => (
            <Link
              key={b.slug}
              href={b.slug === "overall" ? "/ideas/rankings" : `/ideas/rankings?by=${b.slug}`}
              aria-current={b.slug === board.slug ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition ${
                b.slug === board.slug
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              {b.label}
            </Link>
          ))}
        </nav>

        <section className="py-8">
          <ol className="flex flex-col gap-2">
            {ranked.map((idea, i) => {
              const tier = tierOf(idea.aos);
              const headline = board.key ? idea.scores[board.key] : idea.aos;
              return (
                <li key={idea.slug}>
                  <Link
                    href={`/ideas/idea/${idea.slug}`}
                    className="afi-card flex items-center gap-4 rounded-lg border border-card-border bg-card p-4"
                    style={{ "--afi-tier": `var(${tier.cssVar})` }}
                  >
                    <span className="w-7 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <ScoreRing scores={idea.scores} aos={idea.aos} size="sm" />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-semibold tracking-tight text-foreground">
                        {idea.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[0.6875rem] text-muted-foreground">
                        {idea.dna.vertical} · {idea.money.pricingModel} ·{" "}
                        {formatUsd(idea.money.acvLowUsd)} ACV · {EFFORT_LABELS[idea.build.effort]}
                      </span>
                    </span>

                    <span className="hidden w-32 shrink-0 lg:block">
                      <SignalBars scores={idea.scores} />
                    </span>

                    {board.key ? (
                      <span
                        className="w-10 shrink-0 text-right font-mono text-sm font-semibold tabular-nums"
                        style={{ color: `var(${SIGNALS.find((s) => s.key === board.key).cssVar})` }}
                      >
                        {headline}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}
