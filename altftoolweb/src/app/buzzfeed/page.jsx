import Link from "next/link";
import { ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";

export default function AltFPulsePage() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="altf-pulse-title">
        <p className="inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) px-3 py-2 text-sm font-semibold text-(--primary)">
          <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
          Editorial preview paused
        </p>
        <h1 id="altf-pulse-title" className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          AltF Pulse is being rebuilt around attributable stories.
        </h1>
        <p className="mt-5 text-base leading-7 text-(--muted-foreground) sm:text-lg">
          The previous screen used seed articles, placeholder bylines, dates, and engagement values without a real
          editorial publishing system. That feed has been removed instead of presenting sample content as reporting.
        </p>

        <div className="mt-8 flex gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">Publishing requirements</h2>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              New stories will need a real author, source record, publication time, correction path, and a working
              content store before this route is made indexable again.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blogs"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            Read verified AltFTool guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/tools"
            className="inline-flex min-h-11 items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-5 text-sm font-semibold transition hover:border-(--primary) hover:text-(--primary) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            Browse tools
          </Link>
        </div>
      </section>
    </main>
  );
}
