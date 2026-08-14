import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SIGNALS, TIERS } from "@altftool/core/ideas";
import { getManifest, getFacets } from "@altftool/core/ideas/corpus";

/*
 * The citable page. This is what other sites and AI answers link to when
 * explaining how AltF Ideas scores anything, so it states the method plainly,
 * publishes the actual weights and thresholds, and is explicit about limits.
 * Overclaiming here would be the fastest way to lose the trust the whole
 * product is built on.
 */

const description =
  "How the AltF Opportunity Score works: six weighted signals, percentile-anchored tiers, and what the score does and does not tell you.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "How AltF Ideas scores startup ideas — the full methodology",
    description,
    path: "/ideas/learn/scoring-methodology",
    keywords: [
      "startup idea scoring",
      "opportunity score methodology",
      "how to evaluate a startup idea",
      "startup idea validation criteria",
    ],
  });
}

export default async function MethodologyPage() {
  const [manifest, facets] = await Promise.all([getManifest(), getFacets()]);

  const faqs = [
    {
      question: "How is the AltF Opportunity Score calculated?",
      answer:
        "The AOS is the weighted mean of six signals: demand (22%), moat (20%), monetisation (18%), feasibility (16%), timing (14%) and open field (10%). Each signal is scored 0-100. The composite is always the plain weighted average of the six displayed values, so the parts always add up to the whole.",
    },
    {
      question: "What does a good opportunity score look like?",
      answer: `Tiers are anchored to percentiles within the corpus rather than set as absolute grades. Tier S is roughly the top 1% (AOS ${TIERS.s}+), tier A the top 10% (${TIERS.a}+), tier B the top half (${TIERS.b}+), and tier C the remainder. The median idea in the corpus scores ${manifest.aos.median}.`,
    },
    {
      question: "Can I change the weights?",
      answer:
        "Yes. The weights are exposed on the home page and can be re-set to five presets or dragged individually. A solo developer should weight feasibility far higher than a venture-backed team would, and the ranking changes accordingly.",
    },
    {
      question: "Are the scores predictions?",
      answer:
        "No. They are a ranking device for comparing ideas against each other, not a forecast of whether a specific business will succeed. Execution, timing within a market, and founder fit dominate real outcomes and none of them are knowable from an idea alone.",
    },
    {
      question: "Where do the market figures come from?",
      answer:
        "Market size and growth rates are derived from published industry base rates attached to each of the 61 verticals, then adjusted for the specific job and buyer. They are order-of-magnitude estimates for comparison, not audited figures, and should be verified before any funding or hiring decision.",
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-ideas-methodology"
        data={[
          createArticleJsonLd({
            path: "/ideas/learn/scoring-methodology",
            headline: "How AltF Ideas scores startup ideas",
            description,
            datePublished: "2026-03-14",
            dateModified: "2026-07-29",
            author: "AltF Ideas",
          }),
          createFaqJsonLd({ path: "/ideas/learn/scoring-methodology", questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Learn", path: "/ideas/learn" },
            { name: "Scoring methodology", path: "/ideas/learn/scoring-methodology" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <Link href="/ideas/learn" className="hover:text-primary">Learn</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Scoring methodology</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Methodology
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            How AltF Ideas scores an idea
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            Every one of the {manifest.total.toLocaleString("en-US")} ideas in the corpus carries an
            AltF Opportunity Score from 0 to 100. It is the weighted mean of six published signals.
            Nothing is hidden, nothing is post-processed, and you can change the weights yourself.
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">Updated 29 July 2026</p>
        </header>

        <article className="py-8">
          <section className="border-b border-border pb-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              The six signals
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">The six signals and their weights</caption>
                <thead>
                  <tr className="bg-canvas">
                    {["Signal", "Weight", "What it measures"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIGNALS.map((signal) => (
                    <tr key={signal.key} className="border-t border-border">
                      <th scope="row" className="whitespace-nowrap px-3.5 py-3 text-left font-normal">
                        <span className="flex items-center gap-2">
                          <span
                            className="block h-2 w-2 shrink-0 rounded-sm"
                            style={{ background: `var(${signal.cssVar})` }}
                          />
                          <span className="font-medium text-foreground">{signal.label}</span>
                        </span>
                      </th>
                      <td className="px-3.5 py-3 font-mono tabular-nums text-foreground">
                        {signal.weight}%
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">{signal.blurb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Open field is deliberately the inverse of crowding: a high score means incumbents have
              not covered the workflow properly. It carries the smallest weight because an empty
              market is often empty for a reason.
            </p>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Why the parts always add up
            </h2>
            <p className="max-w-[68ch] leading-relaxed text-muted-foreground">
              The composite is calculated as{" "}
              <code className="rounded-sm bg-surface-soft px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
                AOS = Σ(signal × weight) / Σ(weight)
              </code>{" "}
              and nothing else. There is no hidden adjustment layer, no editorial override, and no
              secondary curve applied after the fact. If you add up the six numbers shown on any
              idea page with the weights above, you will get the score printed in the ring.
            </p>
            <p className="mt-3 max-w-[68ch] leading-relaxed text-muted-foreground">
              This constraint matters more than it looks. The moment a composite stops matching its
              visible components, a transparent score becomes a black box with extra steps.
            </p>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              How signals are calibrated
            </h2>
            <p className="max-w-[68ch] leading-relaxed text-muted-foreground">
              Raw signal values are derived from base rates attached to each axis of an idea — the
              industry, the buyer, the job, the technical mechanism, the market wedge, and the
              business model. Left raw, those values cluster tightly around their axis means, which
              would make almost every idea look the same.
            </p>
            <p className="mt-3 max-w-[68ch] leading-relaxed text-muted-foreground">
              Each signal is therefore mapped onto its own percentile curve across the whole corpus,
              spreading it over a 21–97 range with a mild S-curve that keeps a realistic centre mass
              while still populating both tails. A signal score is best read as{" "}
              <em>how this idea compares to the other {manifest.total.toLocaleString("en-US")}</em>,
              not as an absolute measurement of the world.
            </p>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Tiers
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Tier thresholds and corpus distribution</caption>
                <thead>
                  <tr className="bg-canvas">
                    {["Tier", "AOS", "Ideas", "Share"].map((h) => (
                      <th key={h} scope="col" className="px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["S", `${TIERS.s}+`, manifest.aos.tierS, "--afi-tier-s"],
                    ["A", `${TIERS.a}–${TIERS.s - 1}`, manifest.aos.tierA, "--afi-tier-a"],
                    ["B", `${TIERS.b}–${TIERS.a - 1}`, manifest.aos.tierB, "--afi-tier-b"],
                    ["C", `under ${TIERS.b}`, manifest.aos.tierC, "--afi-tier-c"],
                  ].map(([name, range, count, cssVar]) => (
                    <tr key={name} className="border-t border-border">
                      <th scope="row" className="px-3.5 py-3 text-left">
                        <span className="font-mono font-semibold" style={{ color: `var(${cssVar})` }}>
                          {name}
                        </span>
                      </th>
                      <td className="px-3.5 py-3 font-mono tabular-nums text-muted-foreground">{range}</td>
                      <td className="px-3.5 py-3 font-mono tabular-nums text-foreground">
                        {count.toLocaleString("en-US")}
                      </td>
                      <td className="px-3.5 py-3 font-mono tabular-nums text-muted-foreground">
                        {((count / manifest.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-[68ch] leading-relaxed text-muted-foreground">
              Thresholds are anchored to percentiles rather than chosen by feel, because the useful
              question is not &ldquo;is 71 a good score&rdquo; but &ldquo;how does this rank against
              the alternatives&rdquo;. The median idea scores {manifest.aos.median}; the highest in
              the corpus currently scores {manifest.aos.max}.
            </p>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Badges
            </h2>
            <p className="max-w-[68ch] leading-relaxed text-muted-foreground">
              Badges such as <strong className="text-foreground">Underserved</strong> or{" "}
              <strong className="text-foreground">Weekend build</strong> are computed from the score
              components, never written by hand. A badge is a readable shorthand for a threshold that
              has already been met — it cannot claim something the numbers do not support.
            </p>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              What this score does not tell you
            </h2>
            <ul className="max-w-[68ch]">
              {[
                "Whether you specifically should build it. Founder-market fit dominates outcomes and is not knowable from an idea.",
                "Whether the market figures are current. They are order-of-magnitude base rates for comparison, not audited research.",
                "Whether anyone will buy. Only conversations with buyers answer that, which is why every dossier ends with a step that involves talking to eight of them.",
                "Whether it is already being built. A high open-field score means we found no obvious incumbent, not that none exists.",
                "How hard the last 20% is. Every dossier names a hardest part, and it is usually the honest answer to this question.",
              ].map((item) => (
                <li key={item} className="flex gap-3 py-2.5 leading-relaxed text-muted-foreground">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Reproducibility
            </h2>
            <p className="max-w-[68ch] leading-relaxed text-muted-foreground">
              The corpus is generated deterministically. Every value that looks random is a hash of
              the idea&rsquo;s own structural fingerprint, so regenerating from the same taxonomy
              produces byte-identical output. Two people reading the same idea page a month apart
              see the same score, and any change to a score is traceable to a change in the
              published taxonomy rather than to drift.
            </p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Ideas scored", manifest.total.toLocaleString("en-US")],
                ["Industries", String(manifest.verticals)],
                ["Full dossiers", manifest.published.toLocaleString("en-US")],
                ["Jobs mapped", String(manifest.jobs)],
                ["Mechanisms", String(manifest.mechanisms)],
                ["Business models", String(manifest.models)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-canvas p-4">
                  <dd className="font-mono text-lg font-semibold tabular-nums text-foreground">{value}</dd>
                  <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </section>

          <section className="py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Questions
            </h2>
            {faqs.map((faq, i) => (
              <details key={faq.question} className="border-b border-border" open={i === 0}>
                <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="max-w-[68ch] pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </section>

          <section className="rounded-lg border border-border bg-canvas p-6">
            <h2 className="text-base font-semibold text-foreground">Citing this page</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              AltF Ideas (2026). <em>How AltF Ideas scores startup ideas</em>. AltFTool.
              Retrieved from https://www.altftool.com/ideas/learn/scoring-methodology
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Corpus snapshot: {manifest.total.toLocaleString("en-US")} ideas across{" "}
              {manifest.verticals} industries, AOS range {manifest.aos.min}–{manifest.aos.max},
              median {manifest.aos.median}. Collections currently span{" "}
              {Object.keys(facets.collection).length} computed shortlists.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
