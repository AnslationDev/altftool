import Link from "next/link";
import {
  ArrowRight,
  Bed,
  CheckCircle2,
  Code2,
  CreditCard,
  HeartPulse,
  Home,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  { name: "Technology", icon: Code2, description: "Software, devices, and product terms." },
  { name: "Privacy & Security", icon: ShieldCheck, description: "Policies, permissions, and security claims." },
  { name: "Finance", icon: CreditCard, description: "Fees, eligibility, and published account terms." },
  { name: "Home", icon: Home, description: "Products and services for everyday home needs." },
  { name: "Sleep", icon: Bed, description: "Materials, dimensions, trials, and warranty terms." },
  { name: "Health", icon: HeartPulse, description: "Product facts that need especially careful sourcing." },
];

const SOURCE_CHECKLIST = [
  "Open the brand's official product or policy page and note the access date.",
  "Separate measurable specifications from marketing language and user opinion.",
  "Compare equivalent plans, regions, billing periods, and eligibility rules.",
  "Verify prices, availability, and offers again before making a decision.",
];

export default function BrandRatingPage() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <section className="border-b border-(--border) bg-(--card)" aria-labelledby="brand-rating-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) px-3 py-2 text-sm font-semibold text-(--primary)">
            <SearchCheck className="h-4 w-4" aria-hidden="true" />
            Source-first comparison preview
          </p>
          <h1 id="brand-rating-title" className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Compare brand facts without invented ratings.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-(--muted-foreground) sm:text-lg">
            This hub is being rebuilt around dated, attributable sources. Until a verified data pipeline is connected,
            it intentionally publishes no ranks, review totals, testimonials, audience counts, current offers, or
            “featured in” claims.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
            >
              Browse verified tools <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="comparison-categories-title">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-(--primary)">Comparison areas</p>
          <h2 id="comparison-categories-title" className="mt-2 text-3xl font-bold tracking-tight">
            Start with the category, then verify the source.
          </h2>
          <p className="mt-3 leading-7 text-(--muted-foreground)">
            These are navigation topics, not rankings or claims about catalogue size.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ name, icon: Icon, description }) => (
            <article
              key={name}
              className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--anslation-ds-radius-sm)] bg-(--muted) text-(--primary)">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-(--border) bg-(--muted)" aria-labelledby="source-checklist-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-(--primary)">Source checklist</p>
            <h2 id="source-checklist-title" className="mt-2 text-3xl font-bold tracking-tight">
              What a useful comparison must show.
            </h2>
            <p className="mt-3 leading-7 text-(--muted-foreground)">
              A comparison should expose its evidence and limits instead of manufacturing a score.
            </p>
          </div>
          <ul className="grid gap-3">
            {SOURCE_CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)" aria-hidden="true" />
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
