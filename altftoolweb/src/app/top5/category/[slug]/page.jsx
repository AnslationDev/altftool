import { notFound } from "next/navigation";
import { getCategory, getAllCategories } from "../../data/categories";
import { getCountry, getAllCountries } from "../../data/countries";
import { getAllRankings } from "../../data/rankings";
import CategoryHero from "../../components/CategoryHero";
import CategoryExplorer from "../../components/CategoryExplorer";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateStaticParams() {
  const categorySlugs = getAllCategories().map((category) => ({ slug: category.slug }));
  const countrySlugs = getAllCountries().map((country) => ({ slug: country.slug }));
  return [...categorySlugs, ...countrySlugs];
}

// Topics that don't have dedicated rankings yet get hand-picked *related*
// rankings instead of a random "trending everywhere" dump — a Music page
// should surface listening gear and streaming, never universities or SUVs.
// Ordered by closeness; only slugs that exist in data/rankings.js.
const RELATED_PICKS = {
  music: ["wireless-earbuds", "streaming-services", "smartphones", "laptops"],
  books: ["online-learning-platforms", "study-productivity-apps", "global-universities"],
  history: ["global-universities", "cities-after-dark", "rewatchable-films"],
  lifestyle: ["coffee-chains", "cities-after-dark", "meal-kit-services", "food-cities"],
  startups: [
    "business-productivity-suites",
    "crm-software",
    "business-communication-tools",
    "ai-tools",
    "investing-apps",
  ],
  space: ["sci-fi-films", "ai-tools", "laptops"],
  fashion: ["cities-after-dark", "coffee-chains", "food-cities"],
};

function resolveEntity(slug) {
  const category = getCategory(slug);
  if (category) return { kind: "category", ...category };

  const country = getCountry(slug);
  if (country) return { kind: "country", ...country, count: `${country.count}` };

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entity = resolveEntity(slug);
  const path = `/top5/category/${encodeURIComponent(String(slug || ""))}`;

  return createPageMetadata({
    title: entity ? `The best of ${entity.name}` : "Top5 category not found",
    description: entity
      ? `Independent Top5 rankings for the products, people, companies, and ideas moving ${entity.name} forward.`
      : "This Top5 category is not available.",
    path,
    noindex: true,
    follow: true,
  });
}

export default async function Top5CategoryIndexPage({ params }) {
  const { slug } = await params;
  const entity = resolveEntity(slug);
  if (!entity) notFound();

  // Every topic category and country shares this one index template. Only a
  // handful of topics have dedicated rankings authored so far. Resolution
  // order, most honest first:
  //   1. Dedicated rankings for this exact topic — show ONLY those (never
  //      padded out with unrelated cards just to fill the grid).
  //   2. Hand-picked RELATED rankings (e.g. Music → earbuds, streaming) so
  //      the page stays on-topic even before dedicated lists ship.
  //   3. Countries and anything unmapped fall back to site-wide trending,
  //      clearly labelled as such in the heading below.
  // Capped at 6 so the grid never overflows into a large, unbalanced block.
  const allRankings = getAllRankings();
  const matches = allRankings.filter(
    (ranking) => ranking.category.toLowerCase() === entity.name.toLowerCase(),
  );

  const relatedSlugs = RELATED_PICKS[entity.slug] || [];
  const related = relatedSlugs
    .map((rankingSlug) => allRankings.find((ranking) => ranking.slug === rankingSlug))
    .filter(Boolean);

  const mode = matches.length > 0 ? "dedicated" : related.length > 0 ? "related" : "fallback";
  const hasDedicatedRankings = mode === "dedicated";
  const source = mode === "dedicated" ? matches : mode === "related" ? related : allRankings;

  // Only the card-level fields cross to the client explorer — the heavy
  // per-ranking `items` payload stays on the server.
  const rankings = source
    .slice(0, 6)
    .map((ranking) => ({
      slug: ranking.slug,
      shortLabel: ranking.shortLabel,
      category: ranking.category,
      title: ranking.title,
      views: ranking.views,
      updated: ranking.updated,
      updatedLabel: ranking.updatedLabel,
      cardImage: ranking.cardImage,
    }));

  return (
    <div>
      <CategoryHero
        entity={{
          name: entity.name,
          kind: entity.kind,
          countLabel: `${entity.count}`.replace(" rankings", ""),
        }}
      />

      <section id="top5-category-results" className="max-w-7xl mx-auto px-6 py-14 scroll-mt-24">
        <CategoryExplorer
          rankings={rankings}
          entityName={entity.name}
          hasDedicatedRankings={hasDedicatedRankings}
          mode={mode}
        />
      </section>
    </div>
  );
}
