import Link from "next/link";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import Icon from "@/shared/ui/Icon";
import { GAME_GENRES, getGameGenreKey, getGameGenreLabel } from "./gameGenres";

export const dynamic = "force-static";
export const revalidate = 86400;

const GAME_CATEGORY_PATTERN = /^games?$/i;

function getGameEntries() {
  return Object.entries(toolMetaMap)
    .filter(([, tool]) => {
      const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
      return categories.some((category) => GAME_CATEGORY_PATTERN.test(String(category || "").trim()));
    })
    .sort(([, a], [, b]) => a.name.localeCompare(b.name));
}

function GameCard({ slug, tool }) {
  return (
    <li>
      <Link
        href={`/tools/all/${slug}`}
        className="group flex h-full items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span
          className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted ${tool.iconColor || "text-primary"}`}
        >
          <Icon name={tool.icon || "gamepad-2"} className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground group-hover:text-primary">
              {tool.name}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {getGameGenreLabel(slug)}
            </span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </span>
        </span>
      </Link>
    </li>
  );
}

export async function generateMetadata() {
  const count = getGameEntries().length;
  return createPageMetadata({
    title: `AltFTool Games Hub – Play ${count}+ Free Browser Games`,
    description:
      "Play free browser games with no download and no sign-up: puzzle, arcade, word, card and board games including minesweeper, solitaire, sudoku and typing tests.",
    path: "/games",
    keywords: [
      "free online games",
      "browser games",
      "puzzle games",
      "arcade games",
      "word games",
      "card games",
      "play games online free",
      "no download games",
    ],
  });
}

export default function GamesHubPage() {
  const games = getGameEntries();

  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/games",
      name: "Free Online Games",
      description: `Play ${games.length}+ free browser games on AltFTool — puzzle, arcade, word, card and board games with no downloads.`,
    }),
    createItemListJsonLd({
      path: "/games",
      name: "Free Online Games",
      items: games.map(([slug, tool]) => ({ name: tool.name, path: `/tools/all/${slug}` })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Games", path: "/games" },
    ]),
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />

      <header className="mb-8 max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <span className="text-foreground">Games</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Free Online Games
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Play {games.length}+ games right in your browser — no downloads, no sign-up. Puzzle,
          arcade, word, card and board games that work on desktop and mobile.
        </p>
      </header>

      <nav aria-label="Game genres" className="mb-8 flex flex-wrap gap-2">
        {GAME_GENRES.map((genre) => {
          const count = games.filter(([slug]) => getGameGenreKey(slug) === genre.key).length;
          if (!count) return null;
          return (
            <a
              key={genre.key}
              href={`#${genre.key}-games`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {genre.label}
              <span className="text-xs text-muted-foreground">{count}</span>
            </a>
          );
        })}
      </nav>

      {GAME_GENRES.map((genre) => {
        const genreGames = games.filter(([slug]) => getGameGenreKey(slug) === genre.key);
        if (!genreGames.length) return null;
        return (
          <section
            key={genre.key}
            id={`${genre.key}-games`}
            aria-labelledby={`${genre.key}-games-heading`}
            className="mb-10 scroll-mt-24"
          >
            <div className="mb-4">
              <h2
                id={`${genre.key}-games-heading`}
                className="text-xl font-bold tracking-tight text-foreground"
              >
                {genre.label} Games
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{genre.description}</p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {genreGames.map(([slug, tool]) => (
                <GameCard key={slug} slug={slug} tool={tool} />
              ))}
            </ul>
          </section>
        );
      })}

      <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Looking for utilities instead?{" "}
          <Link href="/tools/all" className="font-medium text-primary hover:underline">
            Browse all {Object.keys(toolMetaMap).length}+ free tools
          </Link>
          {" "}or{" "}
          <Link href="/labs" className="font-medium text-primary hover:underline">
            explore AltFTool Labs experiments
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
