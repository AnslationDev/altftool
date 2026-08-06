import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SIGNALS } from "@altftool/core/ideas";
import { VERTICALS, COLLECTION_RULES } from "@altftool/core/ideas/taxonomy";
import { getFacets, getManifest, getShard } from "@altftool/core/ideas/corpus";
import IdeaCard from "./_components/IdeaCard";
import FloorBand from "@/app/(marketing)/components/floor/FloorBand";
import { IDEAS_SCENE } from "@/app/(marketing)/components/floor/scenes";
import ScoreRing from "./_components/ScoreRing";
import { SignalRows } from "./_components/SignalBars";
import WeightTuner from "./_components/WeightTuner";

const description =
  "Browse 117,000+ startup ideas scored on demand, moat, monetisation, feasibility, timing and open field. Every score is shown in full, and every idea ends with a first move.";

const FAQS = [
  {
    question: "Where do these startup ideas come from?",
    answer:
      "Each idea is generated from a structured composite — industry, buyer, job to be done, technical mechanism, market wedge, and business model — then filtered for coherence, deduplicated, and scored against public market base rates. The highest-scoring 12,000 are expanded into full dossiers with market figures, named competitor archetypes, and risks.",
  },
  {
    question: "Is AltF Ideas free?",
    answer:
      "Browsing, searching, filtering, and every published dossier are free with no account. The corpus is not behind a paywall — a database you cannot search is not a database.",
  },
  {
    question: "How is this different from IdeasAI or Stratup.ai?",
    answer:
      "Volume sites give you a title and a vote count. Validation sites give you depth on one idea at a time, for credits. AltF Ideas is the only one with a browsable six-figure corpus where every entry carries structured market evidence, a transparent score you can re-weight yourself, and a concrete next step.",
  },
  {
    question: "Can I trust the scores?",
    answer:
      "Treat them as a ranking device, not a verdict. Every score shows its six components, a confidence band, and a one-sentence rationale, so you can disagree with a specific number rather than the whole thing. The weights are published and adjustable.",
  },
  {
    question: "Does it matter if someone else has the same idea?",
    answer:
      "No. Ideas are not scarce; execution in a specific market with a specific wedge is. That is why every dossier names the hardest part of the build rather than pretending there is not one.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Ideas — 117,000+ startup ideas, scored in the open",
    description,
    path: "/ideas",
    keywords: [
      "startup ideas",
      "AI startup ideas",
      "business ideas",
      "startup idea generator",
      "validated startup ideas",
      "SaaS ideas",
    ],
  });
}

export default async function IdeasHomePage() {
  const [manifest, facets, topShard] = await Promise.all([
    getManifest(),
    getFacets(),
    getShard(0),
  ]);

  const featured = topShard[0];
  const topIdeas = topShard.slice(0, 6);

  // The tuner is a client component, so only the fields it actually renders
  // cross the boundary — full records would bloat the RSC payload ~20x.
  const tunerIdeas = topShard.slice(0, 40).map((idea) => ({
    slug: idea.slug,
    title: idea.title,
    scores: idea.scores,
    aos: idea.aos,
    dna: { vertical: idea.dna.vertical },
  }));

  const stats = [
    { value: manifest.total.toLocaleString("en-US"), label: "Scored ideas" },
    { value: String(manifest.verticals), label: "Verticals covered" },
    { value: String(SIGNALS.length), label: "Open signals per idea" },
    { value: "2,749", label: "Tools to build with" },
  ];

  const collections = COLLECTION_RULES.map((rule) => ({
    ...rule,
    count: facets.collection[rule.slug] ?? 0,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <>
      <JsonLd
        id="altf-ideas-schema"
        data={[
          createCollectionPageJsonLd({ path: "/ideas", name: "AltF Ideas", description }),
          createItemListJsonLd({
            path: "/ideas",
            name: "Highest-scoring startup ideas",
            items: topIdeas.map((idea) => ({ name: idea.title, path: `/ideas/idea/${idea.slug}` })),
          }),
          createFaqJsonLd({ path: "/ideas", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
          ]),
        ]}
      />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div
          className="afi-grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{
            maskImage:
              "radial-gradient(ellipse 90% 65% at 30% 0%, var(--foreground) 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 65% at 30% 0%, var(--foreground) 20%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-[0.8125rem] font-medium text-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary ring-4 ring-primary/15" />
              <span className="font-mono">{manifest.total.toLocaleString("en-US")}</span> ideas scored
            </span>

            <h1 className="mt-5 text-[clamp(2.5rem,5.4vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-foreground">
              Find the idea worth
              <br />
              your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                next two years.
              </span>
            </h1>

            {/* Answer-first paragraph: the chunk generative engines lift verbatim. */}
            <p className="mt-5 max-w-[46ch] text-[clamp(1rem,1.35vw,1.125rem)] leading-relaxed text-muted-foreground">
              AltF Ideas is a searchable corpus of {manifest.total.toLocaleString("en-US")} startup
              ideas, each scored 0–100 on demand, moat, monetisation, feasibility, timing and open
              field. Every score is shown in full, every idea carries its market evidence, and every
              one ends with the first move you make on Monday.
            </p>

            <form action="/ideas/browse" className="mt-7 flex max-w-xl flex-col gap-2.5 sm:flex-row">
              <div className="flex h-13 flex-1 items-center gap-3 rounded-lg border border-border bg-surface px-4 focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <label className="sr-only" htmlFor="afi-q">
                  Search startup ideas
                </label>
                <input
                  id="afi-q"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="voice agents for clinics under $10k to build…"
                  className="h-12 w-full min-w-0 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-13 items-center justify-center rounded-lg bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Search ideas
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-xs text-muted-foreground">TRY</span>
              {collections.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/ideas/collections/${c.slug}`}
                  className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
                >
                  {c.title.toLowerCase()}
                </Link>
              ))}
            </div>
          </div>

          {/* Featured idea */}
          <aside className="rounded-xl border border-border-strong bg-gradient-to-br from-surface to-canvas p-7 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                Top idea right now
              </span>
              <span className="rounded-sm border border-border bg-surface-soft px-2 py-1 font-mono text-xs text-muted-foreground">
                #{featured.rank} of {manifest.total.toLocaleString("en-US")}
              </span>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <ScoreRing scores={featured.scores} aos={featured.aos} size="lg" />
              <div>
                <h2 className="text-[1.375rem] font-semibold leading-snug tracking-tight text-foreground">
                  {featured.title}
                </h2>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {featured.oneLiner}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4.5">
              <SignalRows scores={featured.scores} />
            </div>

            <div className="mt-5 flex items-center justify-end">
              <Link
                href={`/ideas/idea/${featured.slug}`}
                className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-primary hover:underline"
              >
                Open dossier
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 border-y border-border sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-5 py-6 ${i > 0 ? "sm:border-l sm:border-border" : ""} ${
                i % 2 === 1 ? "border-l border-border sm:border-l" : ""
              }`}
            >
              <dd className="font-mono text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-tight tabular-nums text-foreground">
                {stat.value}
              </dd>
              <dt className="mt-0.5 text-[0.8125rem] text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- Explore strip ---------------- */}
      <nav aria-label="Explore AltF Ideas" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/ideas/generate", label: "Generate an idea", hint: "Pick an industry and a job to replace" },
            { href: "/ideas/browse", label: "Browse the corpus", hint: `All ${manifest.published.toLocaleString("en-US")} dossiers, ranked` },
            { href: "/ideas/map", label: "Opportunity map", hint: "Effort against reward, plotted" },
            { href: "/ideas/rankings", label: "Leaderboards", hint: "Top ideas by each signal" },
            { href: "/ideas/for", label: "Ranked for you", hint: "Personas and filtered views" },
            { href: "/ideas/tools/score-my-idea", label: "Score your own idea", hint: "Same six signals, in your browser" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="afi-card flex h-full flex-col gap-1 rounded-lg border border-card-border bg-card p-4"
              >
                <span className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">{item.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------------- How the corpus is built ---------------- */}
      <FloorBand
        scene={IDEAS_SCENE}
        kicker="Behind the corpus"
        title="Ideas do not arrive scored."
        body={`Every one of the ${manifest.total.toLocaleString("en-US")} ideas here is sourced against a vertical, run through the six-signal engine, written up as a dossier with its market evidence and first move, then ranked against the rest of the corpus. The floor below represents that pipeline.`}
        href="/ideas/browse"
        cta="Browse the corpus"
      />

      {/* ---------------- Methodology ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              The scoring
            </span>
            <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
              Six signals. No black box.
            </h2>
            <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
              Every idea is scored on the same six axes, with the weights published. You can see why
              an idea scored 78 instead of 91 — and you can change the weights to match how{" "}
              <em>you</em> build.
            </p>
            <div className="mt-6 rounded-lg border border-border border-l-[3px] border-l-primary bg-canvas p-4.5 text-sm leading-relaxed text-muted-foreground">
              Scores are directional, not a guarantee. Each one ships with a confidence band and a
              plain-English rationale, so you can argue with it.{" "}
              <Link className="text-primary hover:underline" href="/ideas/learn/scoring-methodology">
                Read the full methodology →
              </Link>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {SIGNALS.map((signal) => (
              <li
                key={signal.key}
                className="relative overflow-hidden rounded-lg border border-card-border bg-card p-4.5 pl-5"
              >
                <span
                  className="absolute inset-y-0 left-0 w-[3px]"
                  style={{ background: `var(${signal.cssVar})` }}
                  aria-hidden="true"
                />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                    {signal.label}
                  </span>
                  <span
                    className="font-mono text-xs tabular-nums"
                    style={{ color: `var(${signal.cssVar})` }}
                  >
                    {signal.weight}%
                  </span>
                </div>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {signal.blurb}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Top ideas ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Leaderboard
            </span>
            <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
              Highest-scoring ideas
            </h2>
          </div>
          <Link
            href="/ideas/browse"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-primary hover:underline"
          >
            Browse all {manifest.total.toLocaleString("en-US")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topIdeas.map((idea, i) => (
            <IdeaCard key={idea.slug} idea={idea} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* ---------------- Weight tuner ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-7">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Personalisation
          </span>
          <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
            Tune the score to how you build
          </h2>
        </div>
        <WeightTuner ideas={tunerIdeas} />
      </section>

      {/* ---------------- Collections ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Curated
            </span>
            <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
              Start from a shortlist
            </h2>
          </div>
          <Link
            href="/ideas/collections"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-primary hover:underline"
          >
            All collections
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/ideas/collections/${collection.slug}`}
              className="afi-card flex min-h-40 flex-col gap-2 rounded-lg border border-card-border bg-card p-5.5"
            >
              <span className="font-mono text-[0.6875rem] tracking-wide text-primary">
                {collection.count.toLocaleString("en-US")} IDEAS
              </span>
              <span className="text-[1.0625rem] font-semibold tracking-tight text-foreground">
                {collection.title}
              </span>
              <span className="mt-auto font-mono text-xs text-muted-foreground">
                Open collection →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Verticals ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="mb-7">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            By industry
          </span>
          <h2 className="mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
            {VERTICALS.length} verticals, all mapped
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {VERTICALS.map((vertical) => (
            <Link
              key={vertical.slug}
              href={`/ideas/verticals/${vertical.slug}`}
              className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
            >
              {vertical.name}
              <span className="ml-1.5 opacity-50">{facets.vertical[vertical.slug] ?? 0}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
          Questions
        </span>
        <h2 className="mb-6 mt-3 text-[clamp(1.625rem,3vw,2.125rem)] font-semibold tracking-tight text-foreground">
          Straight answers
        </h2>
        <div className="max-w-3xl">
          {FAQS.map((faq, i) => (
            <details key={faq.question} className="border-b border-border" open={i === 0}>
              <summary className="cursor-pointer list-none py-4.5 text-base font-medium tracking-tight text-foreground marker:hidden hover:text-primary">
                {faq.question}
              </summary>
              <div className="max-w-[62ch] pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
