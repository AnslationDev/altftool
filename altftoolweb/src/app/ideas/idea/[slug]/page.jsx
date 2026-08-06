import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SIGNALS,
  derivedBadges,
  tierOf,
  EFFORT_LABELS,
  EFFORT_PHRASES,
  formatUsd,
  withArticle,
} from "@altftool/core/ideas";
import { getIdeaBySlug, getTopIndex, getShard, getManifest } from "@altftool/core/ideas/corpus";
import ScoreRing from "../../_components/ScoreRing";
import { SignalRows } from "../../_components/SignalBars";

export const revalidate = 86400;
export const dynamicParams = true;

/* Pre-render the strongest ideas; the rest render on demand and are then
   cached by ISR. Building all 12,000 up front would add ~20 minutes to CI
   for pages that receive almost no traffic in their first week. */
export async function generateStaticParams() {
  const index = await getTopIndex();
  return index.slice(0, 1000).map((entry) => ({ slug: entry.s }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = await getIdeaBySlug(slug);
  if (!resolved) return createPageMetadata({ title: "Idea not found", path: `/ideas/idea/${slug}` });

  const { idea, published } = resolved;
  return createPageMetadata({
    title: `${idea.title} — startup idea scored ${idea.aos}/100`,
    description: `${idea.oneLiner} Scored ${idea.aos}/100 on demand, moat, monetisation, feasibility, timing and open field, with market size, competitors, risks and a first move.`,
    path: `/ideas/idea/${idea.slug}`,
    keywords: [idea.dna.vertical, idea.dna.job, "startup idea", idea.dna.model, idea.title],
    // Every idea in the corpus gets a real page, but we only ask search engines
    // to index the published tier. Submitting 105k generated pages is exactly
    // the thin-content pattern this product is positioned against.
    // NOTE: this helper takes noindex/follow booleans — a `robots` object is
    // silently ignored.
    noindex: !published,
    follow: true,
  });
}

const BUILD_PATH = [
  {
    title: "Pressure-test the premise",
    desc: "Score problem urgency, willingness to pay, and reachable audience size before writing any code.",
    tool: "AltF IdeaLab",
    href: "/products/idea-lab",
  },
  {
    title: "Talk to eight buyers",
    desc: "Ask how they handle this today and what it costs them. If nobody can quantify the pain, the demand score is optimistic.",
    tool: "Survey Builder",
    href: "/tools/all/survey-builder",
  },
  {
    title: "Name it and secure the domain",
    desc: "Check availability, DNS, and email authentication in one pass so your first outreach lands in an inbox.",
    tool: "AltF DomainOps",
    href: "/products/domainops",
  },
  {
    title: "Wire the workflow first",
    desc: "Stand up intake, the review queue, and billing before you build the clever part.",
    tool: "AltF Flow",
    href: "/products/flow",
  },
];

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 text-[0.8125rem] last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export default async function IdeaDossierPage({ params }) {
  const { slug } = await params;
  const resolved = await getIdeaBySlug(slug);
  if (!resolved) notFound();

  const { idea, published } = resolved;
  const [manifest, shard] = await Promise.all([getManifest(), getShard(0)]);
  const tier = tierOf(idea.aos);
  const badges = derivedBadges(idea.scores);

  const best = SIGNALS.reduce((a, b) => (idea.scores[b.key] > idea.scores[a.key] ? b : a));
  const worst = SIGNALS.reduce((a, b) => (idea.scores[b.key] < idea.scores[a.key] ? b : a));

  const related = shard
    .filter((x) => x.slug !== idea.slug)
    .map((x) => ({
      x,
      overlap: Object.keys(idea.dna).filter((k) => x.dna[k] === idea.dna[k]).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || b.x.aos - a.x.aos)
    .slice(0, 5)
    .map((r) => r.x);

  const faqs = [
    {
      question: `How much does it cost to start ${idea.title}?`,
      answer: `Roughly ${formatUsd(idea.money.startupCostLowUsd)} to ${formatUsd(idea.money.startupCostHighUsd)} to reach a working first version, on an estimated build effort of ${EFFORT_PHRASES[idea.build.effort]}.`,
    },
    {
      question: "What is the hardest part of building this?",
      answer: idea.build.hardestPart,
    },
    {
      question: "How long until the first dollar?",
      answer: `About ${idea.money.timeToFirstRevenueDays} days in the optimistic case. Treat roughly double that as the realistic figure, because the sales cycle usually runs longer than the build.`,
    },
    {
      question: "Why now?",
      answer: idea.whyNow,
    },
  ];

  const answerFirst = `${idea.title} is ${withArticle(idea.dna.mechanism)} aimed at ${idea.dna.vertical.toLowerCase()} ${idea.dna.buyer.toLowerCase()}s, covering ${idea.dna.job}. It scores ${idea.aos}/100 on AltF Ideas, carried by ${best.label.toLowerCase()} (${idea.scores[best.key]}) and held back by ${worst.label.toLowerCase()} (${idea.scores[worst.key]}). Typical pricing is ${formatUsd(idea.money.acvLowUsd)}–${formatUsd(idea.money.acvHighUsd)} per customer per year, with a first version reachable in ${EFFORT_PHRASES[idea.build.effort]} for ${formatUsd(idea.money.startupCostLowUsd)}–${formatUsd(idea.money.startupCostHighUsd)}.`;

  return (
    <>
      <JsonLd
        id={`altf-idea-${idea.slug}`}
        data={[
          createArticleJsonLd({
            path: `/ideas/idea/${idea.slug}`,
            headline: `${idea.title} — startup idea scored ${idea.aos}/100`,
            description: idea.oneLiner,
            datePublished: "2026-03-14",
            dateModified: manifest.builtAt ?? "2026-07-29",
            author: "AltF Ideas",
          }),
          createFaqJsonLd({ path: `/ideas/idea/${idea.slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: idea.dna.vertical, path: `/ideas/verticals/${idea.dna.verticalSlug}` },
            { name: idea.title, path: `/ideas/idea/${idea.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <Link href={`/ideas/verticals/${idea.dna.verticalSlug}`} className="hover:text-primary">
            {idea.dna.vertical}
          </Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">{idea.title}</span>
        </nav>

        {/* Hero */}
        <div className="grid items-start gap-8 border-b border-border pb-8 sm:grid-cols-[1fr_auto] sm:gap-14">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
              Idea #{idea.id} · Rank {idea.rank.toLocaleString("en-US")} of{" "}
              {manifest.total.toLocaleString("en-US")}
            </span>
            {!published ? (
              <p className="mt-3 rounded-lg border border-border border-l-[3px] border-l-warning bg-canvas p-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                This idea sits outside the top{" "}
                {manifest.published.toLocaleString("en-US")} and has not been through editorial
                review. The score and figures are generated the same way, but treat it as a
                starting point rather than a shortlist entry.
              </p>
            ) : null}
            <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
              {idea.title}
            </h1>
            <p className="mt-3.5 max-w-[56ch] text-[clamp(1rem,1.35vw,1.125rem)] leading-relaxed text-muted-foreground">
              {idea.oneLiner}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className="rounded-sm border border-primary/30 bg-primary-soft px-2 py-0.5 font-mono text-[0.6875rem] text-primary"
                >
                  {b.label}
                </span>
              ))}
              <span className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {idea.dna.vertical}
              </span>
              <span className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {idea.money.pricingModel}
              </span>
              <span className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {EFFORT_LABELS[idea.build.effort]} to MVP
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/products/idea-lab"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Validate this idea
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={`/ideas/verticals/${idea.dna.verticalSlug}`}
                className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-[0.9375rem] font-medium text-foreground transition hover:border-border-strong hover:bg-surface-soft"
              >
                More {idea.dna.vertical} ideas
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <ScoreRing scores={idea.scores} aos={idea.aos} size="lg" />
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
              style={{ color: `var(${tier.cssVar})` }}
            >
              <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              Tier {tier.name}
            </span>
            <span className="text-center font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
              Confidence: {idea.confidence}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="grid items-start gap-10 py-10 lg:grid-cols-[1fr_19rem] lg:gap-14">
          <div>
            {/* Answer-first block, written to be lifted verbatim by AI engines */}
            <div className="afi-answer mb-8 rounded-lg border border-border bg-canvas p-5">
              <p className="text-[0.9375rem] leading-relaxed text-foreground">
                <strong>In short:</strong> {answerFirst}
              </p>
            </div>

            <section className="border-b border-border pb-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Score breakdown
              </h2>
              <div className="rounded-lg border border-border bg-canvas p-6">
                <SignalRows scores={idea.scores} />
                <div className="mt-5 flex gap-3 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <strong className="text-foreground">Why {idea.aos}:</strong>{" "}
                    {idea.scoreRationale} Weights are demand 22, moat 20, monetisation 18,
                    feasibility 16, timing 14, open field 10 — the score is the plain weighted mean,
                    so the parts always add up to the whole.
                  </span>
                </div>
              </div>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                The problem
              </h2>
              <p className="max-w-[68ch] leading-relaxed text-muted-foreground">{idea.problem}</p>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                The solution
              </h2>
              <p className="max-w-[68ch] leading-relaxed text-muted-foreground">{idea.solution}</p>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Market and economics
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Market and economics for {idea.title}</caption>
                  <tbody>
                    {[
                      ["Total addressable market", formatUsd(idea.market.tamUsd)],
                      ["Category growth (CAGR)", `${idea.market.cagrPct}%`],
                      ["Annual contract value", `${formatUsd(idea.money.acvLowUsd)} – ${formatUsd(idea.money.acvHighUsd)}`],
                      ["Pricing model", idea.money.pricingModel],
                      ["Time to first revenue", `${idea.money.timeToFirstRevenueDays} days`],
                      ["Startup cost to MVP", `${formatUsd(idea.money.startupCostLowUsd)} – ${formatUsd(idea.money.startupCostHighUsd)}`],
                      ["Build effort", EFFORT_LABELS[idea.build.effort]],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-border last:border-b-0">
                        <th scope="row" className="w-2/5 px-3.5 py-3 text-left font-normal text-muted-foreground">
                          {k}
                        </th>
                        <td className="px-3.5 py-3 font-mono tabular-nums text-foreground">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Why now
              </h2>
              <p className="max-w-[68ch] leading-relaxed text-muted-foreground">{idea.whyNow}</p>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Who else is here
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Competitor archetypes and their gaps</caption>
                  <thead>
                    <tr className="bg-canvas">
                      <th scope="col" className="px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                        Who
                      </th>
                      <th scope="col" className="px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                        The gap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {idea.competitors.map((c) => (
                      <tr key={c.name} className="border-t border-border">
                        <td className="px-3.5 py-3 text-foreground">{c.name}</td>
                        <td className="px-3.5 py-3 text-muted-foreground">{c.gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Risks
              </h2>
              <ul className="max-w-[68ch]">
                {idea.risks.map((risk) => (
                  <li key={risk} className="flex gap-3 py-2.5 leading-relaxed text-muted-foreground">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                    {risk}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-danger/30 bg-danger-soft p-5">
                <div className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-danger">
                  Hardest part
                </div>
                <p className="text-[0.9375rem] leading-relaxed text-foreground">
                  {idea.build.hardestPart}
                </p>
              </div>
            </section>

            <section className="border-b border-border py-8">
              <h2 className="mb-2 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Your first move
              </h2>
              <p className="mb-5 max-w-[68ch] text-muted-foreground">
                An idea you cannot act on is entertainment. Four concrete steps, wired to tools
                already running on AltFTool.
              </p>
              <ol className="flex flex-col gap-3">
                {BUILD_PATH.map((step, i) => (
                  <li key={step.title} className="flex gap-4 rounded-lg border border-border bg-surface p-4.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-primary-soft font-mono text-xs font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
                        {step.title}
                      </div>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                      <Link
                        href={step.href}
                        className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                      >
                        → {step.tool}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="py-8">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                Questions about this idea
              </h2>
              <div className="max-w-3xl">
                {faqs.map((faq, i) => (
                  <details key={faq.question} className="border-b border-border" open={i === 0}>
                    <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                      {faq.question}
                    </summary>
                    <div className="pb-4.5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
            <div className="rounded-lg border border-card-border bg-card p-5">
              <h2 className="mb-3.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                At a glance
              </h2>
              <dl>
                <Row label="Opportunity score" value={`${idea.aos} / 100`} />
                <Row label="TAM" value={formatUsd(idea.market.tamUsd)} />
                <Row label="Growth" value={`${idea.market.cagrPct}% CAGR`} />
                <Row label="ACV" value={`${formatUsd(idea.money.acvLowUsd)}–${formatUsd(idea.money.acvHighUsd)}`} />
                <Row label="Startup cost" value={formatUsd(idea.money.startupCostLowUsd)} />
                <Row label="First revenue" value={`${idea.money.timeToFirstRevenueDays} days`} />
                <Row label="Effort" value={EFFORT_LABELS[idea.build.effort]} />
              </dl>
            </div>

            <div className="rounded-lg border border-card-border bg-card p-5">
              <h2 className="mb-3.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Idea DNA
              </h2>
              <dl className="flex flex-col gap-2">
                {[
                  ["Vertical", idea.dna.vertical],
                  ["Buyer", idea.dna.buyer],
                  ["Job", idea.dna.job],
                  ["Mechanism", idea.dna.mechanism],
                  ["Wedge", idea.dna.wedge],
                  ["Model", idea.dna.model],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-[0.8125rem]">
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="text-right text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-card-border bg-card p-5">
              <h2 className="mb-3.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Related ideas
              </h2>
              <ul>
                {related.map((r) => {
                  const t = tierOf(r.aos);
                  return (
                    <li key={r.slug} className="border-b border-border last:border-b-0">
                      <Link
                        href={`/ideas/idea/${r.slug}`}
                        className="flex items-start gap-3 py-2.5 hover:text-primary"
                      >
                        <span
                          className="pt-0.5 font-mono text-xs tabular-nums"
                          style={{ color: `var(${t.cssVar})` }}
                        >
                          {r.aos}
                        </span>
                        <span className="text-[0.8125rem] leading-snug text-foreground">
                          {r.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
