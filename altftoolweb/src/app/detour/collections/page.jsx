import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTIONS, TIME_BANDS, VIBES } from "@altftool/core/detour/taxonomy";
import { FACETS } from "@altftool/core/detour";
import Icon from "../_components/Icon";

export const revalidate = 86400;

const description =
  "Cross-sections of the Detour directory that answer a mood rather than a topic — ten minutes to kill, quiet tabs, safe at your desk, the old internet, and more.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Curated collections — AltF Detour",
    description,
    path: "/detour/collections",
    keywords: [
      "curated website collections",
      "best websites lists",
      "website collections by mood",
    ],
  });
}

export default async function CollectionsIndexPage() {
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Collections", path: "/detour/collections" },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path: "/detour/collections",
    name: "Detour collections",
    description,
  });

  const itemList = createItemListJsonLd({
    path: "/detour/collections",
    name: "Detour collections",
    items: COLLECTIONS.map((collection) => ({
      name: collection.name,
      path: `/detour/collections/${collection.id}`,
    })),
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      <JsonLd data={collectionPage} />
      {itemList ? <JsonLd data={itemList} /> : null}

      <Link
        href="/detour"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Detour
      </Link>

      <header className="mt-5 max-w-2xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--dtr-accent-text)" }}
        >
          Cut a different way
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Collections
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          {description}
        </p>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => (
          <li
            key={collection.id}
            className="dtr-card relative flex flex-col rounded-xl border border-border bg-card p-5"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Icon
                name={collection.icon}
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "var(--dtr-accent)" }}
              />
              <Link
                href={`/detour/collections/${collection.id}`}
                className="dtr-card__link outline-none"
              >
                {collection.name}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {collection.blurb}
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {FACETS.collection[collection.id]} sites
            </p>
          </li>
        ))}
      </ul>

      {/* The other two ways to slice the catalog, so this page is the single
          answer to "what are my options" rather than one of three. */}
      <section className="mt-14 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">By time you have</h2>
          <ul className="mt-3 space-y-2">
            {TIME_BANDS.map((band) => (
              <li key={band.id}>
                <Link
                  href={`/detour/time/${band.id}`}
                  className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-[var(--dtr-accent)]"
                >
                  <span className="font-medium">{band.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {FACETS.timeToJoy[band.id]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">By mood</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {VIBES.map((vibe) => (
              <li key={vibe.id}>
                <Link
                  href={`/detour/vibes/${vibe.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:border-[var(--dtr-accent)]"
                >
                  <span aria-hidden="true">{vibe.emoji}</span>
                  {vibe.label}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {FACETS.vibe[vibe.id]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
