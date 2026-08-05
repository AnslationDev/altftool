import Hero from "./components/Hero";
import CategoryMarquee from "./components/CategoryMarquee";
import Top5Showcase from "./components/Top5Showcase";
import TrendingSection from "./components/TrendingSection";
import CategoriesSection from "./components/CategoriesSection";
import FeaturedCollectionsSection from "./components/FeaturedCollectionsSection";
import PopularSection from "./components/PopularSection";
import LiveActivitySection from "./components/LiveActivitySection";
import StatsBand from "./components/StatsBand";
import MethodologyIntro from "./components/MethodologyIntro";
import MethodologySteps from "./components/MethodologySteps";
import ClosingCta from "./components/ClosingCta";
import Newsletter from "./components/Newsletter";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRanking, getAllRankings } from "./data/rankings";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Discover the World's Top 5 Rankings",
    description:
      "A more considered way to find the people, products, places, and ideas that define what is exceptional. Explore Top5 rankings by category and country.",
    path: "/top5",
    noindex: true,
    follow: true,
  });
}

// ---------------------------------------------------------------------------
// Performance: the full rankings dataset (~115KB of authored copy) lives on
// the server only. Each client section below receives just the slim fields
// it renders, so none of that weight ships in the browser bundle or has to
// be parsed/hydrated on load.
// ---------------------------------------------------------------------------

function parseViews(views) {
  const match = String(views).match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!match) return 0;
  const unit = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase()] || 1;
  return parseFloat(match[1]) * unit;
}

const slimCard = (r) => ({
  slug: r.slug,
  shortLabel: r.shortLabel,
  category: r.category,
  title: r.title,
  views: r.views,
  updatedLabel: r.updatedLabel,
  cardImage: r.cardImage,
});

const QUICK_LINK_SLUGS = [
  "ai-tools",
  "global-universities",
  "football-players",
  "electric-cars",
  "cities-after-dark",
];

const FEATURED_SLUGS = ["global-universities", "football-players", "electric-cars"];

const EDITORIAL_PICK_SLUGS = [
  "cities-after-dark",
  "food-cities",
  "rewatchable-films",
  "business-productivity-suites",
];

export default function Top5HomePage() {
  const all = getAllRankings();

  // Hero: slug → { cardImage, title } for the fanned quick-link cards.
  const quickRankings = Object.fromEntries(
    QUICK_LINK_SLUGS.map((slug) => {
      const r = getRanking(slug);
      return [slug, r ? { cardImage: r.cardImage, title: r.title } : null];
    }).filter(([, value]) => value),
  );

  // Showcase countdown: one flagship ranking + slim per-entry fields.
  const showcaseSource = getRanking("ai-tools");
  const showcaseRanking = showcaseSource
    ? {
        ...slimCard(showcaseSource),
        items: showcaseSource.items.map((item) => ({
          rank: item.rank,
          name: item.name,
          blurb: item.blurb,
          score: item.score,
        })),
      }
    : null;

  // Trending carousel: ten most-viewed, pre-sorted here.
  const trendingItems = [...all]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, 10)
    .map(slimCard);

  // Featured trio, popular list, dated updates, and authored editorial picks.
  const featured = FEATURED_SLUGS.map((slug) => getRanking(slug))
    .filter(Boolean)
    .map((r) => ({ ...slimCard(r), readTime: r.readTime }));

  const popularItems = all.map(slimCard);

  const updates = [...all]
    .sort(
      (a, b) =>
        (Date.parse(b.updated) || 0) - (Date.parse(a.updated) || 0),
    )
    .slice(0, 4)
    .map((ranking) => ({
      slug: ranking.slug,
      shortLabel: ranking.shortLabel,
      category: ranking.category,
      updated: ranking.updated,
      entriesCount: ranking.items.length,
    }));

  const editorialPicks = EDITORIAL_PICK_SLUGS.map((slug) => getRanking(slug))
    .filter(Boolean)
    .map((ranking) => ({
      slug: ranking.slug,
      shortLabel: ranking.shortLabel,
      category: ranking.category,
    }));

  return (
    <>
      <Hero quickRankings={quickRankings} />
      <CategoryMarquee />
      <Top5Showcase ranking={showcaseRanking} />
      <TrendingSection items={trendingItems} />
      <CategoriesSection />
      <FeaturedCollectionsSection featured={featured} />
      <PopularSection items={popularItems} />
      <LiveActivitySection updates={updates} editorialPicks={editorialPicks} />
      <StatsBand />
      <MethodologyIntro />
      <MethodologySteps />
      <ClosingCta />
      <Newsletter />
    </>
  );
}
