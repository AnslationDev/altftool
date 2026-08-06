import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { VERTICALS } from "@altftool/core/ideas/taxonomy";
import { getAllPublished, getFacets, getManifest } from "@altftool/core/ideas/corpus";
import QuadrantMap from "./QuadrantMap";

export const revalidate = 86400;

const description =
  "Every scored startup idea plotted on effort against reward. Four quadrants: quick wins, big bets, fillers, and money pits.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup idea opportunity map — effort vs reward",
    description,
    path: "/ideas/map",
    keywords: [
      "startup opportunity map",
      "effort vs reward matrix",
      "startup idea comparison chart",
      "opportunity matrix",
    ],
  });
}

/* Plotting all 12,000 published ideas would ship ~4MB to the client and render
   as an unreadable smear. A stratified sample keeps every industry represented
   while staying under ~1,400 points, which reads cleanly at this canvas size. */
/* Sampling cap per industry.
   Two reasons this is not higher: 1,550 dots overplot into a smear rather than
   a readable scatter, and the prerendered page has to stay under the 1 MiB
   response budget that scripts/check-prerender-size.mjs enforces — every point
   costs both an SSR'd <circle> and a slot in the serialised client payload. */
const PER_VERTICAL_CAP = 14;

export default async function MapPage() {
  const [all, manifest, facets] = await Promise.all([
    getAllPublished(),
    getManifest(),
    getFacets(),
  ]);

  const perVertical = new Map();
  const sampled = [];
  for (const idea of all) {
    const key = idea.dna.verticalSlug;
    const used = perVertical.get(key) ?? 0;
    if (used >= PER_VERTICAL_CAP) continue;
    perVertical.set(key, used + 1);
    sampled.push({
      slug: idea.slug,
      title: idea.title,
      aos: idea.aos,
      // Only feasibility is read per-point (the x axis). Sending the whole
      // six-signal object would trip the prerender budget for no gain.
      scores: { feasibility: idea.scores.feasibility },
      reward: Math.round(
        idea.scores.demand * 0.4 + idea.scores.money * 0.36 + idea.scores.moat * 0.24,
      ),
      vertical: idea.dna.vertical,
      verticalSlug: idea.dna.verticalSlug,
      tamUsd: idea.market.tamUsd,
      effort: idea.build.effort,
    });
  }

  const verticals = VERTICALS.filter((v) => (facets.vertical[v.slug] ?? 0) > 0).map((v) => ({
    slug: v.slug,
    name: v.name,
  }));

  const faqs = [
    {
      question: "What is a startup opportunity map?",
      answer:
        "A scatter plot that positions ideas by how hard they are to build against how much they could return. It turns a ranked list into a picture where the trade-off you are actually making becomes visible: quick wins sit top-right, big bets top-left.",
    },
    {
      question: "How is reward calculated here?",
      answer:
        "Reward blends demand (40%), monetisation (36%) and moat (24%). It deliberately excludes timing and crowding, which is why an idea can sit high on this map and still rank lower on the overall opportunity score.",
    },
    {
      question: "Why are the quadrants split at the median rather than at 50?",
      answer:
        "The map plots the highest-scoring ideas in the corpus, so their raw scores all sit in the upper range. Splitting at a fixed 50 would leave two quadrants completely empty and make the framing decorative. Splitting at the median of what is plotted keeps all four populated and changes the question to the useful one: is this harder or easier than the other strong ideas you are choosing between.",
    },
    {
      question: "Why are some ideas missing?",
      answer: `The map samples up to ${PER_VERTICAL_CAP} ideas per industry from the published set so that every one of the ${manifest.verticals} industries stays visible and the plot stays readable. Use browse or an industry hub to see the full list.`,
    },
  ];

  return (
    <>
      <JsonLd
        id="altf-ideas-map"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/map", name: "Opportunity map", description }),
          createFaqJsonLd({ path: "/ideas/map", questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Map", path: "/ideas/map" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Map</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Opportunity map
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Effort against reward
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {sampled.length.toLocaleString("en-US")} ideas plotted by how hard they are to build
            against how much they could return. A ranked list hides the trade-off you are making;
            a map makes it the first thing you see.
          </p>
        </header>

        <section className="py-8">
          <QuadrantMap points={sampled} verticals={verticals} />
        </section>

        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="max-w-3xl">
            {faqs.map((faq, i) => (
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
