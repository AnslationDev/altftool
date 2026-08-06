import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDES } from "./guides";

const description =
  "Practical guides on validating, scoring, and choosing between startup ideas — written to be useful rather than to hold a keyword.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Learn — how to validate, score, and choose a startup idea",
    description,
    path: "/ideas/learn",
    keywords: [
      "how to validate a startup idea",
      "startup idea evaluation",
      "startup idea guides",
      "startup validation framework",
    ],
  });
}

export default function LearnIndexPage() {
  return (
    <>
      <JsonLd
        id="altf-ideas-learn"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/learn", name: "AltF Ideas guides", description }),
          createItemListJsonLd({
            path: "/ideas/learn",
            name: "Guides on evaluating startup ideas",
            items: [
              { name: "How AltF Ideas scores startup ideas", path: "/ideas/learn/scoring-methodology" },
              ...GUIDES.map((g) => ({ name: g.title, path: `/ideas/learn/${g.slug}` })),
            ],
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Learn", path: "/ideas/learn" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Learn</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Learn
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            How to tell a good idea from a plausible one
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            The corpus tells you what to consider. These explain how to think about it — validating
            without fooling yourself, scoring to rank rather than to decide, and recognising the red
            flags that take two years to surface.
          </p>
        </header>

        <section className="border-b border-border py-8">
          <Link
            href="/ideas/learn/scoring-methodology"
            className="afi-card block rounded-lg border border-border-strong bg-gradient-to-br from-surface to-canvas p-6"
          >
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-primary">
              Start here
            </span>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              How AltF Ideas scores an idea
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
              The full methodology: six weighted signals, percentile-anchored tiers, how signals are
              calibrated, and an explicit list of what the score does not tell you.
            </p>
            <span className="mt-3 inline-block font-mono text-xs text-muted-foreground">
              Read the methodology →
            </span>
          </Link>
        </section>

        <section className="py-8">
          <h2 className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            Guides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/ideas/learn/${guide.slug}`}
                className="afi-card flex min-h-44 flex-col gap-2 rounded-lg border border-card-border bg-card p-5"
              >
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  {guide.readingMinutes} min read
                </span>
                <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-foreground">
                  {guide.title}
                </h3>
                <p className="line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {guide.description}
                </p>
                <span className="mt-auto font-mono text-xs text-muted-foreground">Read →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
