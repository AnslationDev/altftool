import GameGridSection from "@/app/altfgame/_components/GameGrid";
import { GAMES, CATEGORIES, TRENDING, POPULAR, NEW_RELEASES } from "@/app/altfgame/_data/games";
import { ArrowRight, Clock, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "AltF Games - Free Browser Games",
  description: "Play fast, free browser games with no download or account required.",
  alternates: { canonical: "/altfgame" },
  openGraph: {
    title: "AltF Games - Free Browser Games",
    description: "Play fast, free browser games with no download or account required.",
    url: "/altfgame",
    type: "website",
  },
};

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="mb-12">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-foreground/60">{icon}</span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
          </div>
        </div>
        <Link
          href="/altfgame"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-secondary"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

export default function GamesIndex() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Games</h1>
        <p className="mt-2 text-foreground/60">
          {GAMES.length} games across {CATEGORIES.length} categories. Pick one to start.
        </p>
      </div>

      <div className="mb-12 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/altfgame/category/${c.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/60 hover:bg-muted"
          >
            <span aria-hidden="true">{c.emoji}</span> {c.name}
            <span className="text-xs text-foreground/60">({c.count})</span>
          </Link>
        ))}
      </div>

      <Section
        icon={<Flame className="h-5 w-5" />}
        title="Trending Now"
        subtitle="Hot games"
      >
        <GameGridSection games={TRENDING.slice(0, 5)} variant="rail" />
      </Section>

      <Section
        icon={<TrendingUp className="h-5 w-5" />}
        title="Most Popular"
        subtitle="Most played games"
      >
        <GameGridSection games={POPULAR.slice(0, 6)} />
      </Section>

      <Section
        icon={<Clock className="h-5 w-5" />}
        title="New Releases"
        subtitle="Latest additions"
      >
        <GameGridSection games={NEW_RELEASES.slice(0, 4)} variant="rail" />
      </Section>

      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Browse All</h2>
        <GameGridSection games={GAMES} />
      </div>
    </div>
  );
}
