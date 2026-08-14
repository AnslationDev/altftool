import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { formatUsd, EFFORT_PHRASES } from "@altftool/core/ideas";
import { VERTICALS } from "@altftool/core/ideas/taxonomy";
import {
  getFacets,
  getIdeasBySlugs,
  getVerticalIndex,
} from "@altftool/core/ideas/corpus";
import IdeaListing from "../../_components/IdeaListing";

const PER_PAGE = 24;

export const revalidate = 86400;

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

function findVertical(slug) {
  return VERTICALS.find((v) => v.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vertical = findVertical(slug);
  if (!vertical) return createPageMetadata({ title: "Not found", path: `/ideas/verticals/${slug}` });

  const facets = await getFacets();
  const count = facets.vertical[slug] ?? 0;

  return createPageMetadata({
    title: `${count.toLocaleString("en-US")} ${vertical.name} startup ideas, scored and ranked`,
    description: `Every ${vertical.name.toLowerCase()} startup idea in the AltF corpus, scored on demand, moat, monetisation, feasibility, timing and open field. Market size, build effort and first steps included.`,
    path: `/ideas/verticals/${slug}`,
    keywords: [
      `${vertical.name} startup ideas`,
      `${vertical.name} SaaS ideas`,
      `${vertical.name} business ideas`,
      `AI ideas for ${vertical.name}`,
    ],
  });
}

export default async function VerticalPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const vertical = findVertical(slug);
  if (!vertical) notFound();

  const page = Math.max(1, Number.parseInt(query?.page ?? "1", 10) || 1);

  let index;
  try {
    index = await getVerticalIndex(slug);
  } catch {
    notFound();
  }

  const facets = await getFacets();
  const start = (page - 1) * PER_PAGE;
  const pageRows = index.slice(start, start + PER_PAGE);

  // Only the published set has full records; anything deeper is listed by the
  // compact index alone, so we resolve what we can and keep the order.
  const ideas = await getIdeasBySlugs(pageRows.map((r) => r.s));

  const best = index[0];
  const avg = Math.round(index.reduce((sum, r) => sum + r.a, 0) / (index.length || 1));
  const weekendCount = index.filter((r) => r.e === "weekend").length;

  const faqs = [
    {
      question: `How many ${vertical.name.toLowerCase()} startup ideas are there?`,
      answer: `AltF Ideas holds ${index.length.toLocaleString("en-US")} scored ${vertical.name.toLowerCase()} ideas. The average opportunity score is ${avg}/100, and the strongest currently is "${best?.t}" at ${best?.a}/100.`,
    },
    {
      question: `Is ${vertical.name.toLowerCase()} a good industry to build software for?`,
      answer: `The software market here is roughly ${formatUsd(vertical.tam)} growing at about ${vertical.cagr}% a year. Its open-field score of ${vertical.o}/100 indicates ${vertical.o >= 75 ? "significant room — incumbents have not covered the workflows properly" : vertical.o >= 55 ? "moderate crowding, so a specific wedge matters" : "a crowded field where differentiation has to be sharp"}.`,
    },
    {
      question: `Which ${vertical.name.toLowerCase()} ideas can one person build?`,
      answer: `${weekendCount.toLocaleString("en-US")} of them carry a weekend build effort, meaning a single developer can reach a first shippable version in ${EFFORT_PHRASES.weekend}. Filter by build effort to see them.`,
    },
  ];

  const relatedVerticals = VERTICALS.filter((v) => v.slug !== slug)
    .map((v) => ({
      name: v.name,
      path: `/ideas/verticals/${v.slug}`,
      count: facets.vertical[v.slug] ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <>
      <JsonLd
        id={`altf-ideas-vertical-${slug}`}
        data={[
          createCollectionPageJsonLd({
            path: `/ideas/verticals/${slug}`,
            name: `${vertical.name} startup ideas`,
            description: `Scored ${vertical.name.toLowerCase()} startup ideas with market data and build paths.`,
          }),
          createItemListJsonLd({
            path: `/ideas/verticals/${slug}`,
            name: `${vertical.name} startup ideas by opportunity score`,
            items: ideas.map((idea) => ({ name: idea.title, path: `/ideas/idea/${idea.slug}` })),
          }),
          createFaqJsonLd({ path: `/ideas/verticals/${slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Verticals", path: "/ideas/verticals" },
            { name: vertical.name, path: `/ideas/verticals/${slug}` },
          ]),
        ]}
      />

      <IdeaListing
        breadcrumb={[
          { name: "Ideas", path: "/ideas" },
          { name: "Verticals", path: "/ideas/verticals" },
          { name: vertical.name },
        ]}
        eyebrow="Industry"
        title={`${vertical.name} startup ideas`}
        answer={`There are ${index.length.toLocaleString("en-US")} scored ${vertical.name.toLowerCase()} startup ideas in the AltF corpus, averaging ${avg}/100 on the opportunity score. The software market in this industry is around ${formatUsd(vertical.tam)} growing at ${vertical.cagr}% a year, with an open-field score of ${vertical.o}/100. Every idea below carries its full six-signal breakdown, market figures, and a four-step first move.`}
        stats={[
          { value: index.length.toLocaleString("en-US"), label: "Ideas scored" },
          { value: `${avg}/100`, label: "Average score" },
          { value: formatUsd(vertical.tam), label: "Software TAM" },
          { value: `${vertical.cagr}%`, label: "Category CAGR" },
          { value: weekendCount.toLocaleString("en-US"), label: "Weekend builds" },
        ]}
        ideas={ideas}
        total={index.length}
        page={page}
        perPage={PER_PAGE}
        basePath={`/ideas/verticals/${slug}`}
        relatedTitle="Other industries"
        related={relatedVerticals}
      >
        <section className="border-b border-border py-8">
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
      </IdeaListing>
    </>
  );
}
