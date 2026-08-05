import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Play } from "lucide-react";

export default function GameHero() {
  return (
    <section
      className="relative isolate mb-12 min-h-[420px] overflow-hidden rounded-xl border border-border bg-surface shadow-md"
      aria-labelledby="altf-games-heading"
    >
      <Image
        src="/images/games/chess.webp"
        alt="AltF Chess game board"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1280px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />

      <div className="relative flex min-h-[420px] max-w-2xl flex-col justify-center p-8 sm:p-12 lg:p-16">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-pill border border-primary/30 bg-surface/90 px-3 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Play instantly
        </span>
        <h1
          id="altf-games-heading"
          className="text-4xl font-bold leading-tight text-foreground sm:text-5xl"
        >
          Free browser games, ready when you are.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Jump into quick puzzles, arcade challenges, strategy games, and more. No install or account required.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/altfgame/chess"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            Play Chess
          </Link>
          <a
            href="#all-games"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Browse games
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
