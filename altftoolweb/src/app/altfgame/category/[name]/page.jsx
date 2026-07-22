import { notFound } from "next/navigation";
import GameGrid from "@/app/altfgame/_components/GameGrid";
import { CATEGORIES, categoryFromSlug, getByCategory } from "@/app/altfgame/_data/games";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return CATEGORIES.map((c) => ({ name: c.slug }));
}

export async function generateMetadata({ params }) {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} Games`,
    description: `Play free ${category.name.toLowerCase()} games online.`,
    alternates: { canonical: `/altfgame/category/${name}` },
    openGraph: {
      title: `${category.name} Games`,
      description: `Play free ${category.name.toLowerCase()} games online.`,
      url: `/altfgame/category/${name}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const category = categoryFromSlug(name);
  if (!category) notFound();

  const games = getByCategory(category.name);

  return (
    <div className="w-full">
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
