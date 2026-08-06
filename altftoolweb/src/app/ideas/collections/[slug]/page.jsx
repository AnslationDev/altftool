import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTION_RULES } from "@altftool/core/ideas/taxonomy";
import { getFacets, getIdeasBySlugs, getTopIndex } from "@altftool/core/ideas/corpus";
import IdeaListing from "../../_components/IdeaListing";

const PER_PAGE = 24;
export const revalidate = 86400;

/* Editorial framing per collection — the rule says what qualifies, this says
   why a founder should care. */
const BLURBS = {
  "weekend-build-saas":
    "Feasibility of 92 or above. One person, a couple of days, and a first version real enough to put in front of a buyer.",
  "boring-and-profitable":
    "High monetisation in industries nobody is fighting over. Unglamorous work with contracts that renew.",
  "ai-native-2026":
    "Ideas that were technically impossible eighteen months ago. The enabling shift is recent enough that incumbents have not adapted.",
  "deep-moat-plays":
    "Data loops and workflow lock-in that compound. Slower to start, much harder to copy.",
  "under-5k-startup-cost":
    "A complete first version inside a four-figure budget, so the downside is a few weekends rather than a year.",
  "no-competition":
    "Open field of 94 or above. Genuinely unserved workflows where the incumbent is a spreadsheet or a person.",
  "fast-first-dollar":
    "Revenue inside a month. Useful when you need the idea to fund itself rather than the other way round.",
  "high-acv-niche":
    "Small buyer counts, large contracts. You do not need many customers to build a real business.",
  "solo-founder-scale":
    "Buildable and operable by one person, without a support team or an ops hire.",
  "contrarian-bets":
    "Low measured demand but a strong moat. Everyone else has written these off, which is exactly the point.",
  "proven-demand":
    "Demand of 93 or above. The question is not whether people want it, only whether you can build it well.",
  "top-100": "The highest-scoring ideas in the entire corpus, across every industry.",
};

export function generateStaticParams() {
  return COLLECTION_RULES.map((c) => ({ slug: c.slug }));
}

function findCollection(slug) {
  return COLLECTION_RULES.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = findCollection(slug);
  if (!collection) {
    return createPageMetadata({ title: "Not found", path: `/ideas/collections/${slug}` });
  }
  const facets = await getFacets();
  const count = facets.collection[slug] ?? 0;

  return createPageMetadata({
    title: `${collection.title} — ${count.toLocaleString("en-US")} scored startup ideas`,
    description: `${BLURBS[slug] ?? ""} Every idea scored on demand, moat, monetisation, feasibility, timing and open field.`,
    path: `/ideas/collections/${slug}`,
    keywords: [collection.title, "startup ideas", "curated startup ideas"],
  });
}

export default async function CollectionPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const collection = findCollection(slug);
  if (!collection) notFound();

  const page = Math.max(1, Number.parseInt(query?.page ?? "1", 10) || 1);

  const [index, facets] = await Promise.all([getTopIndex(), getFacets()]);
  const rows = index.filter((r) => r.c.includes(slug));

  const start = (page - 1) * PER_PAGE;
  const ideas = await getIdeasBySlugs(rows.slice(start, start + PER_PAGE).map((r) => r.s));

  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.a, 0) / rows.length) : 0;

  const related = COLLECTION_RULES.filter((c) => c.slug !== slug).map((c) => ({
    name: c.title,
    path: `/ideas/collections/${c.slug}`,
    count: facets.collection[c.slug] ?? 0,
  }));

  return (
    <>
      <JsonLd
        id={`altf-ideas-collection-${slug}`}
        data={[
          createCollectionPageJsonLd({
            path: `/ideas/collections/${slug}`,
            name: collection.title,
            description: BLURBS[slug],
          }),
          createItemListJsonLd({
            path: `/ideas/collections/${slug}`,
            name: collection.title,
            items: ideas.map((idea) => ({ name: idea.title, path: `/ideas/idea/${idea.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Collections", path: "/ideas/collections" },
            { name: collection.title, path: `/ideas/collections/${slug}` },
          ]),
        ]}
      />

      <IdeaListing
        breadcrumb={[
          { name: "Ideas", path: "/ideas" },
          { name: "Collections", path: "/ideas/collections" },
          { name: collection.title },
        ]}
        eyebrow="Collection"
        title={collection.title}
        answer={`${BLURBS[slug] ?? ""} ${rows.length.toLocaleString("en-US")} ideas qualify, averaging ${avg}/100 on the opportunity score. Membership is computed from the scores rather than chosen by hand, so the list updates whenever the corpus is rebuilt.`}
        stats={[
          { value: rows.length.toLocaleString("en-US"), label: "Ideas in this list" },
          { value: `${avg}/100`, label: "Average score" },
          { value: rows[0] ? `${rows[0].a}/100` : "—", label: "Top score" },
        ]}
        ideas={ideas}
        total={rows.length}
        page={page}
        perPage={PER_PAGE}
        basePath={`/ideas/collections/${slug}`}
        relatedTitle="Other collections"
        related={related}
      />
    </>
  );
}
