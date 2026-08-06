import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { VERTICALS, MECHANISMS, COLLECTION_RULES } from "@altftool/core/ideas/taxonomy";
import { getFacets, getManifest, getPublishedRange } from "@altftool/core/ideas/corpus";
import IdeaListing from "../_components/IdeaListing";

const PER_PAGE = 24;

const description =
  "Browse every scored startup idea by industry, mechanism, business model and build effort. Sorted by opportunity score, with the full six-signal breakdown on every card.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Browse startup ideas — filter 117,000+ by industry and effort",
    description,
    path: "/ideas/browse",
    keywords: ["browse startup ideas", "startup idea database", "SaaS ideas by industry"],
  });
}

export default async function BrowsePage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params?.page ?? "1", 10) || 1);

  const [manifest, facets] = await Promise.all([getManifest(), getFacets()]);

  const published = manifest.published;
  const start = (page - 1) * PER_PAGE;
  const ideas = start < published ? await getPublishedRange(start, PER_PAGE) : [];

  const topVerticals = VERTICALS.map((v) => ({
    name: v.name,
    path: `/ideas/verticals/${v.slug}`,
    count: facets.vertical[v.slug] ?? 0,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 24);

  return (
    <>
      <JsonLd
        id="altf-ideas-browse"
        data={[
          createCollectionPageJsonLd({
            path: "/ideas/browse",
            name: "Browse startup ideas",
            description,
          }),
          createItemListJsonLd({
            path: "/ideas/browse",
            name: "Startup ideas by opportunity score",
            items: ideas.map((idea) => ({
              name: idea.title,
              path: `/ideas/idea/${idea.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Browse", path: "/ideas/browse" },
          ]),
        ]}
      />

      <IdeaListing
        breadcrumb={[
          { name: "Ideas", path: "/ideas" },
          { name: "Browse" },
        ]}
        eyebrow="The corpus"
        title="Browse every scored idea"
        answer={`AltF Ideas holds ${manifest.total.toLocaleString("en-US")} startup ideas across ${manifest.verticals} industries, each scored 0–100 on demand, moat, monetisation, feasibility, timing and open field. The ${published.toLocaleString("en-US")} highest-scoring have full dossiers with market size, competitor archetypes, risks, and a four-step build path. Sorted by opportunity score, best first.`}
        stats={[
          { value: manifest.total.toLocaleString("en-US"), label: "Ideas scored" },
          { value: published.toLocaleString("en-US"), label: "Full dossiers" },
          { value: String(manifest.verticals), label: "Industries" },
          { value: String(Object.keys(MECHANISMS).length), label: "Mechanisms" },
        ]}
        ideas={ideas}
        total={published}
        page={page}
        perPage={PER_PAGE}
        basePath="/ideas/browse"
        relatedTitle="Jump to an industry"
        related={topVerticals}
      >
        <section className="border-b border-border py-6">
          <h2 className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            Curated shortlists
          </h2>
          <div className="flex flex-wrap gap-2">
            {COLLECTION_RULES.filter((c) => (facets.collection[c.slug] ?? 0) > 0).map((c) => (
              <Link
                key={c.slug}
                href={`/ideas/collections/${c.slug}`}
                className="rounded-sm border border-border bg-surface-soft px-2.5 py-1 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                {c.title}
                <span className="ml-1.5 opacity-50">{facets.collection[c.slug]}</span>
              </Link>
            ))}
          </div>
        </section>
      </IdeaListing>
    </>
  );
}
