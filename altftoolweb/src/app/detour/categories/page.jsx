import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CATEGORIES_BY_FAMILY } from "@altftool/core/detour/taxonomy";
import { FACETS, STATS } from "@altftool/core/detour";
import Icon from "../_components/Icon";

export const revalidate = 86400;

const description =
  "Every topic in the Detour directory, grouped into eight families — play, make, learn, wander, unwind, laugh, weird and retro. Pick a subject and get the best of it.";

export async function generateMetadata() {
  return createPageMetadata({
    title: `All ${STATS.categories} categories — AltF Detour`,
    description,
    path: "/detour/categories",
    keywords: [
      "website categories",
      "types of websites",
      "website directory categories",
      "interesting website topics",
    ],
  });
}

export default async function CategoriesPage() {
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Categories", path: "/detour/categories" },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path: "/detour/categories",
    name: "Detour categories",
    description,
  });

  const itemList = createItemListJsonLd({
    path: "/detour/categories",
    name: "Detour categories",
    items: CATEGORIES_BY_FAMILY.flatMap((family) =>
      family.categories.map((category) => ({
        name: category.name,
        path: `/detour/category/${category.id}`,
      })),
    ),
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
          {STATS.categories} topics · {STATS.sites.toLocaleString("en-GB")} sites
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Every category
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          {description}
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {CATEGORIES_BY_FAMILY.map((family) => (
          <section key={family.id} aria-labelledby={`family-${family.id}`}>
            <div className="flex items-baseline gap-3">
              <h2
                id={`family-${family.id}`}
                className="flex items-center gap-2 text-xl font-bold tracking-tight"
              >
                <Icon
                  name={family.icon}
                  className="h-5 w-5"
                  style={{ color: "var(--dtr-accent)" }}
                />
                {family.name}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {FACETS.family[family.id]} sites
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{family.blurb}</p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {family.categories.map((category) => (
                <li
                  key={category.id}
                  className="dtr-card relative rounded-xl border border-border bg-card p-4"
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Icon name={category.icon} className="h-4 w-4 flex-shrink-0" />
                    <Link
                      href={`/detour/category/${category.id}`}
                      className="dtr-card__link outline-none"
                    >
                      {category.name}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {category.blurb}
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                    {FACETS.category[category.id]} sites
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
