import Link from "next/link";
import { notFound } from "next/navigation";
import GamePlayer from "@/app/altfgame/_components/GamePlayer";
import RelatedGames from "@/app/altfgame/_components/RelatedGames";
import GameGrid from "@/app/altfgame/_components/GameGrid";
import GameThumb from "@/app/altfgame/_components/GameThumb";
import StarRating from "@/app/altfgame/_components/StarRating";
import { GAMES, getGame, getRelated, getRecommended } from "@/app/altfgame/_data/games";
import { GAME_COMPONENTS } from "../registry";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createGameJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) {
    return createPageMetadata({
      title: "Game not found",
      path: `/altfgame/${slug}`,
      noindex: true,
      follow: false,
    });
  }
  return createPageMetadata({
    title: `${game.title} - Play Online`,
    description: `${game.description} Play ${game.title} free in your browser and discover more ${game.category.toLowerCase()} games on AltFTool.`,
    path: `/altfgame/${slug}`,
    image: game.image,
    keywords: [game.title, `${game.category} game`, "free browser game"],
    pageType: "games",
  });
}

export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  const Game = GAME_COMPONENTS[slug];

  if (!game || !Game) notFound();

  const related = getRelated(slug, 8);
  const recommended = getRecommended(slug, 6);
  const gamePath = `/altfgame/${slug}`;
  const beyondGames = getRelatedContent({
    source: {
      href: gamePath,
      title: game.title,
      description: game.description,
      tags: [game.category, `${game.category} game`, "free browser game"],
      section: "games",
    },
    slots: [
      { sections: ["tools", "experiences"], limit: 3 },
      { sections: ["blogs", "top9", "hubs"], limit: 3, minScore: 0 },
    ],
  });
  const jsonLd = [
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "AltF Games", path: "/altfgame" },
      { name: game.title, path: gamePath },
    ]),
    createGameJsonLd({ game, path: gamePath }),
  ];

  return (
    <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <JsonLd id={`altf-game-${slug}-schema`} data={jsonLd} />
      {/* Main column */}
      <div className="min-w-0">
        <GamePlayer game={game}>
          <Game />
        </GamePlayer>

        <RelatedGames title={`More ${game.category} games`} games={related} />

        {/* Recommended as a rail on mobile / tablet */}
        <section className="mt-12 lg:hidden">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Recommended</h2>
          <GameGrid games={recommended} variant="rail" />
        </section>
      </div>

      {/* Recommended sidebar (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/60">
            Recommended
          </h2>
          <div className="flex flex-col gap-2">
            {recommended.map((g) => (
              <Link
                key={g.slug}
                href={`/altfgame/${g.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition hover:border-primary/60"
              >
                <GameThumb game={g} className="h-14 w-14 shrink-0" rounded="rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{g.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-foreground/60">
                    <StarRating value={g.rating} />
                    <span>{g.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <RelatedContentSection
        title="Beyond games"
        items={beyondGames}
        path={gamePath}
        jsonLdName={`Beyond games: related picks for ${game.title}`}
        className="lg:col-span-2"
      />
    </main>
  );
}
