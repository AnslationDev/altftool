import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getPromptCards, getPromptCategories } from "./data/service";

/**
 * `/prompts` had no route of its own, so Next fell through to the catch-all and
 * served the not-found document with HTTP 200 — a soft 404 with a 34-character
 * description and no h1. This is the hub that URL should have been answering:
 * one server-rendered h1, a real description, and links into every collection
 * that lives underneath it.
 *
 * Counts are read from the same data module the collection pages render from,
 * so the copy cannot drift away from what a visitor actually finds.
 */

// The prompt data is static JS, so this hub has nothing to fetch per request.
// It renders once at build time and revalidates daily alongside the child
// collection pages.
export const dynamic = "force-static";
export const revalidate = 86400;

const COLLECTIONS = [
  {
    slug: "seedream-5-pro",
    name: "Seedream 5 Pro",
    path: "/prompts/seedream-5-pro",
    summary:
      "Community-collected image prompts, each with a preview image and the full prompt behind a one-tap copy button. Search the collection, filter it by style, and sort by most liked or newest.",
    getPrompts: getPromptCards,
    getCategories: getPromptCategories,
  },
];

// Enough style names to show the range without turning the intro into a list.
const FEATURED_STYLE_LIMIT = 12;

function getCollections() {
  return COLLECTIONS.map((collection) => {
    const prompts = collection.getPrompts();
    const categories = collection.getCategories();
    return {
      ...collection,
      promptCount: prompts.length,
      categoryCount: categories.length,
      categories,
    };
  });
}

export async function generateMetadata() {
  const [primary] = getCollections();
  const promptCount = primary?.promptCount ?? 0;
  const categoryCount = primary?.categoryCount ?? 0;

  return createPageMetadata({
    title: "AI Image Prompts – Free Copy-Ready Library",
    // 153 chars at today's counts. trimMetaDescription (generateMetadata.js)
    // only passes a description through verbatim when it is under 160 AND ends
    // in terminal punctuation — otherwise it hard-cuts mid-phrase and bolts on
    // a period. The two interpolated counts are the only moving parts, and
    // between them they can grow six more digits before that becomes a risk.
    description: `Free AI image prompts you can copy in one tap. The Seedream 5 Pro collection holds ${promptCount} prompts across ${categoryCount} styles, from portrait and fantasy to concept art.`,
    path: "/prompts",
    keywords: [
      "AI image prompts",
      "Seedream 5 Pro prompts",
      "copy paste AI prompts",
      "AI art prompt library",
      "text to image prompts",
      "free prompt examples",
    ],
  });
}

function CollectionCard({ collection }) {
  const featuredStyles = collection.categories.slice(0, 6);

  return (
    <li>
      <article className="h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
        <h3 className="text-lg font-semibold tracking-tight text-card-foreground">
          <Link
            href={collection.path}
            className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {collection.name} prompts
          </Link>
        </h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {collection.promptCount} prompts · {collection.categoryCount} styles
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{collection.summary}</p>
        {featuredStyles.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${collection.name} styles`}>
            {featuredStyles.map((category) => (
              <li
                key={category.slug}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm">
          <Link
            href={collection.path}
            className="inline-flex min-h-9 items-center rounded-md font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse {collection.promptCount} {collection.name} prompts
          </Link>
        </p>
      </article>
    </li>
  );
}

export default function PromptsHubPage() {
  const collections = getCollections();
  const totalPrompts = collections.reduce((sum, entry) => sum + entry.promptCount, 0);

  // Merge every collection's style list so the hub can show the whole range,
  // heaviest first, without repeating a style that two collections share.
  const styleTotals = new Map();
  for (const collection of collections) {
    for (const category of collection.categories) {
      const previous = styleTotals.get(category.slug);
      styleTotals.set(category.slug, {
        name: category.name,
        count: (previous?.count || 0) + (Number(category.count) || 0),
      });
    }
  }
  const styles = [...styleTotals.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const featuredStyles = styles.slice(0, FEATURED_STYLE_LIMIT);

  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/prompts",
      name: "AI Image Prompt Library",
      description: `Free, copy-ready AI image prompt collections on AltFTool — ${totalPrompts} prompts you can search, filter by style and copy in one tap.`,
    }),
    createItemListJsonLd({
      path: "/prompts",
      name: "AI Image Prompt Collections",
      items: collections.map((collection) => ({
        name: `${collection.name} prompts`,
        path: collection.path,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Prompts", path: "/prompts" },
    ]),
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <JsonLd id="prompts-hub-schema" data={jsonLd} />

      <header className="mb-8 max-w-2xl">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
          <Link
            href="/"
            className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <span className="text-foreground">Prompts</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Image Prompt Library
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {totalPrompts} copy-ready image prompts, free and with no sign-up. Every card previews the
          prompt text alongside the image it produced, and one tap copies the whole prompt to your
          clipboard so you can paste it straight into your own image generator.
        </p>
      </header>

      <section aria-labelledby="prompt-collections-heading" className="mb-10">
        <h2
          id="prompt-collections-heading"
          className="mb-4 text-xl font-bold tracking-tight text-foreground"
        >
          Prompt collections
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </ul>
      </section>

      {featuredStyles.length > 0 && (
        <section aria-labelledby="prompt-styles-heading" className="mb-10">
          <h2
            id="prompt-styles-heading"
            className="mb-1 text-xl font-bold tracking-tight text-foreground"
          >
            Styles you will find
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The most common looks across the library. Filter by any of them inside a collection.
          </p>
          <ul className="flex flex-wrap gap-2">
            {featuredStyles.map((style) => (
              <li
                key={style.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
              >
                {style.name}
                <span className="text-xs text-muted-foreground">{style.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Want to build a prompt instead of copying one?{" "}
          {/* /tools/ai 301s to /tools/ai-tools — link the canonical slug so the
              hub does not spend an internal hop. */}
          <Link
            href="/tools/ai-tools"
            className="font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Try the free AI tools
          </Link>{" "}
          or{" "}
          <Link
            href="/tools/all"
            className="font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            browse every AltFTool utility
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
