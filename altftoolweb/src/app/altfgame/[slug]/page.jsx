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

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.title} - Play Online`,
    description: game.description,
    alternates: { canonical: `/altfgame/${slug}` },
    openGraph: {
      title: `${game.title} - Play Online`,
      description: game.description,
      url: `/altfgame/${slug}`,
      type: "website",
    },
  };
}

export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  const Game = GAME_COMPONENTS[slug];

  if (!game || !Game) notFound();

  const related = getRelated(slug, 8);
  const recommended = getRecommended(slug, 6);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
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
    </div>
  );
}
