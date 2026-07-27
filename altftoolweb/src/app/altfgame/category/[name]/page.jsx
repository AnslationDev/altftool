import { notFound } from "next/navigation";
import GameGrid from "@/app/altfgame/_components/GameGrid";
import { CATEGORIES, categoryFromSlug, getByCategory } from "@/app/altfgame/_data/games";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";

// Below this many games a category page is a thin listing and is not indexed.
const MIN_INDEXABLE_GAMES = 4;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return CATEGORIES.map((c) => ({ name: c.slug }));
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) {
    return createPageMetadata({
      title: "Game category not found",
      path: `/altfgame/category/${name}`,
      noindex: true,
      follow: false,
    });
  }
  const gameCount = getByCategory(category.name).length;
  return createPageMetadata({
    title: `${category.name} Games`,
    description: `Play ${gameCount} free ${category.name.toLowerCase()} games online in your browser and explore more quick, accessible games on AltFTool.`,
    path: `/altfgame/category/${name}`,
    keywords: [`${category.name} games`, "free browser games", "online games"],
    pageType: "games",
    // A category holding fewer than four games is a thin listing: it adds no
    // information the game pages do not already carry. Keep it crawlable for
    // the links, but out of the index.
    noindex: gameCount < MIN_INDEXABLE_GAMES,
  });
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) notFound();

  const games = getByCategory(category.name);
  const path = `/altfgame/category/${name}`;
  const description = `Play ${games.length} free ${category.name.toLowerCase()} games online in your browser and explore more quick, accessible games on AltFTool.`;
  const jsonLd = [
    createCollectionPageJsonLd({
      path,
      name: `${category.name} Games`,
      description,
    }),
    createItemListJsonLd({
      path,
      name: `${category.name} Games`,
      items: games.map((game) => ({
        name: game.title,
        path: `/altfgame/${game.slug}`,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "AltF Games", path: "/altfgame" },
      { name: category.name, path },
    ]),
  ];

  return (
    <div className="w-full">
      <JsonLd id={`altf-games-${name}-schema`} data={jsonLd} />
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl sm:h-14 sm:w-14 sm:text-3xl"
          style={{ backgroundColor: `${category.color}22` }}
          aria-hidden="true"
        >
          {category.emoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{category.name} Games</h1>
          <p className="mt-1 text-sm text-foreground/60 sm:text-base">
            {games.length} {games.length === 1 ? "game" : "games"} in this category
          </p>
        </div>
      </div>

      <GameGrid games={games} />
    </div>
  );
}
