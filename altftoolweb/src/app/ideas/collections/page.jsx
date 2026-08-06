import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTION_RULES } from "@altftool/core/ideas/taxonomy";
import { getFacets } from "@altftool/core/ideas/corpus";

const description =
  "Curated shortlists of scored startup ideas — weekend builds, deep moats, high-contract niches, and contrarian bets. Membership is computed from the scores, not chosen by hand.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup idea collections — curated, scored shortlists",
    description,
    path: "/ideas/collections",
    keywords: ["curated startup ideas", "best startup ideas", "startup idea lists"],
  });
}

export default async function CollectionsIndexPage() {
  const facets = await getFacets();
  const rows = COLLECTION_RULES.map((c) => ({
    ...c,
    count: facets.collection[c.slug] ?? 0,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const accents = [
    "--afi-feasibility",
    "--afi-money",
    "--afi-timing",
    "--afi-moat",
    "--afi-demand",
    "--afi-competition",
  ];

  return (
    <>
      <JsonLd
        id="altf-ideas-collections"
        data={[
          createCollectionPageJsonLd({
            path: "/ideas/collections",
            name: "Startup idea collections",
            description,
          }),
          createItemListJsonLd({
            path: "/ideas/collections",
            name: "AltF Ideas collections",
            items: rows.map((c) => ({ name: c.title, path: `/ideas/collections/${c.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Collections", path: "/ideas/collections" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Collections</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Curated
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Start from a shortlist
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {rows.length} collections, each defined by a rule against the six signals rather than an
            editor&rsquo;s taste. That means membership is reproducible, and a collection updates
            itself whenever the corpus is rebuilt.
          </p>
        </header>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c, i) => (
            <Link
              key={c.slug}
              href={`/ideas/collections/${c.slug}`}
              className="afi-card relative flex min-h-44 flex-col gap-2 overflow-hidden rounded-lg border border-card-border bg-card p-5"
              style={{ "--afi-tier": `var(${accents[i % accents.length]})` }}
            >
              <span
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `var(${accents[i % accents.length]})` }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[0.6875rem] tracking-wide"
                style={{ color: `var(${accents[i % accents.length]})` }}
              >
                {c.count.toLocaleString("en-US")} IDEAS
              </span>
              <span className="text-[1.0625rem] font-semibold tracking-tight text-foreground">
                {c.title}
              </span>
              <span className="mt-auto font-mono text-xs text-muted-foreground">
                Open collection →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
