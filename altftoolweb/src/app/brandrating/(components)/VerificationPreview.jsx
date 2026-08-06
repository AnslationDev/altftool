import Link from "next/link";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

export default function VerificationPreview({ entityName, entityType }) {
  const label = entityName || (entityType === "brand" ? "Brand" : "Category");

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="verification-title">
        <p className="inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) px-3 py-2 text-sm font-semibold text-(--primary)">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Source verification preview
        </p>
        <h1 id="verification-title" className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          {label} comparison data is being verified.
        </h1>
        <p className="mt-5 text-base leading-7 text-(--muted-foreground) sm:text-lg">
          This route remains available for compatibility, but AltFTool will not publish ranks, ratings, review totals,
          testimonials, offers, or recommendations here until each claim has an attributable and dated source.
        </p>

        <div className="mt-8 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="font-semibold">What will be required before publication</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-(--muted-foreground)">
            <li>Official source links and the date each source was checked.</li>
            <li>Comparable plans, regions, prices, specifications, and eligibility rules.</li>
            <li>A correction path for information that changes or cannot be reproduced.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/brandrating"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            Return to brand comparisons <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/tools"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-5 text-sm font-semibold transition hover:border-(--primary) hover:text-(--primary) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
          >
            Browse tools <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export function VerificationLoading() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)" aria-busy="true" aria-label="Loading source verification preview">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="h-8 w-48 animate-pulse rounded-[var(--anslation-ds-radius-sm)] bg-(--muted)" />
        <div className="mt-6 h-12 w-full max-w-2xl animate-pulse rounded-[var(--anslation-ds-radius-sm)] bg-(--muted)" />
        <div className="mt-4 h-6 w-full max-w-3xl animate-pulse rounded-[var(--anslation-ds-radius-sm)] bg-(--muted)" />
        <div className="mt-8 h-40 w-full animate-pulse rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card)" />
      </section>
    </main>
  );
}
