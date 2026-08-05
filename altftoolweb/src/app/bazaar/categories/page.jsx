import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import { getCategoryIcon } from "../components/categoryIcons";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";
import {
  CATEGORY_COUNT,
  SUBCATEGORY_COUNT,
  getAllCategories,
} from "../data/categories";
import { LISTING_COUNT, getCategoryCounts } from "../data/listings";

/**
 * /bazaar/categories — the full taxonomy directory.
 *
 * This is the vertical's main crawl surface: 24 categories and all 176
 * subcategories as real links on one page, each carrying its live ad count so
 * the page is a genuine index rather than a sitemap in disguise. It is also
 * the one page in this vertical that deserves the ItemList node — every other
 * surface deliberately skips it so the `#item-list` @id never collides.
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/categories";

/**
 * Editorial grouping. Ordered by how people actually shop rather than
 * alphabetically; anything a future category adds that is not named here still
 * shows up, under "More on Bazaar", instead of silently vanishing.
 */
const GROUPS = [
  {
    id: "vehicles",
    title: "Vehicles",
    blurb: "Cars, two-wheelers and commercial vehicles, with ownership and kilometre history on every ad.",
    slugs: ["cars", "bikes", "commercial-vehicles-spares"],
  },
  {
    id: "property",
    title: "Property and rentals",
    blurb: "Flats, plots, shops and short-term hire — filterable by BHK, carpet area and furnishing.",
    slugs: ["properties", "rentals"],
  },
  {
    id: "electronics",
    title: "Electronics and tech",
    blurb: "Phones, laptops, appliances, consoles and seller-graded refurbished stock.",
    slugs: ["mobiles", "electronics-appliances", "gaming", "refurbished"],
  },
  {
    id: "home",
    title: "Home, tools and family",
    blurb: "Everything that furnishes, fixes or outfits a household.",
    slugs: ["furniture", "tools-hardware", "kids-baby"],
  },
  {
    id: "lifestyle",
    title: "Lifestyle and leisure",
    blurb: "Clothing, books, sports gear, collectibles and outdoor kit.",
    slugs: ["fashion", "books-sports-hobbies", "art-collectibles", "travel-outdoor", "health-wellness"],
  },
  {
    id: "work",
    title: "Work and business",
    blurb: "Local hiring, trades and the machinery that runs a small business or a farm.",
    slugs: ["jobs", "services", "industrial-business", "agriculture-farming"],
  },
  {
    id: "community",
    title: "Community",
    blurb: "Pets, event listings and things being given away for nothing.",
    slugs: ["pets", "events-tickets", "free-giveaway"],
  },
];

function buildGroups() {
  const bySlug = new Map(getAllCategories().map((category) => [category.slug, category]));
  const used = new Set();

  const groups = GROUPS.map((group) => ({
    ...group,
    categories: group.slugs
      .map((slug) => {
        const category = bySlug.get(slug);
        if (category) used.add(slug);
        return category;
      })
      .filter(Boolean),
  })).filter((group) => group.categories.length > 0);

  const leftovers = getAllCategories().filter((category) => !used.has(category.slug));
  if (leftovers.length > 0) {
    groups.push({
      id: "more",
      title: "More on Bazaar",
      blurb: "Everything else people list here.",
      categories: leftovers,
    });
  }

  return groups;
}

export async function generateMetadata() {
  return createPageMetadata({
    title: `All ${CATEGORY_COUNT} Bazaar Categories — ${SUBCATEGORY_COUNT} Subcategories`,
    description: `Every AltF Bazaar category and subcategory in one directory: ${CATEGORY_COUNT} categories, ${SUBCATEGORY_COUNT} subcategories and ${LISTING_COUNT} live ads. Jump straight to what you are buying or selling.`,
    path: PATH,
    keywords: [
      "classifieds categories",
      "buy and sell categories",
      "olx categories india",
      "bazaar category directory",
    ],
  });
}

export default async function BazaarCategoriesPage() {
  const counts = getCategoryCounts();
  const groups = buildGroups();
  const categories = getAllCategories();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Categories", path: PATH },
  ];

  const busiest = [...categories]
    .map((category) => ({ category, count: counts.get(category.slug) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-categories-directory"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Bazaar categories",
            description: `All ${CATEGORY_COUNT} categories and ${SUBCATEGORY_COUNT} subcategories on AltF Bazaar.`,
          }),
          // The only ItemList in the vertical — this is the page it describes.
          createItemListJsonLd({
            path: PATH,
            name: "AltF Bazaar categories",
            items: categories.map((category) => ({
              name: category.name,
              path: `/bazaar/c/${category.slug}`,
            })),
          }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Browse all Bazaar categories</h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            {CATEGORY_COUNT} categories, {SUBCATEGORY_COUNT} subcategories and{" "}
            {LISTING_COUNT.toLocaleString("en-IN")} live ads. Every count below is the real number
            of ads in that category right now — a category with three ads says three, because a
            padded number wastes your time and ours.
          </p>
        </header>

        <section className="bzr-section" aria-label="Busiest categories">
          <SectionHead title="Busiest right now" href="/bazaar" linkLabel="Bazaar home" />
          <div className="bzr-cat-grid">
            {busiest.map(({ category, count }) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <Link
                  key={category.slug}
                  href={`/bazaar/c/${category.slug}`}
                  className="bzr-cat-tile"
                >
                  <span className="bzr-cat-icon">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="bzr-cat-name">{category.name}</span>
                  <span className="bzr-cat-count">
                    {count.toLocaleString("en-IN")} ad{count === 1 ? "" : "s"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {groups.map((group) => (
          <section key={group.id} className="bzr-section" aria-label={group.title}>
            <SectionHead title={group.title} as="h2" />
            <p className="-mt-3 mb-4 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              {group.blurb}
            </p>

            <div className="grid gap-3 lg:grid-cols-2">
              {group.categories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                const count = counts.get(category.slug) || 0;
                return (
                  <article
                    key={category.slug}
                    className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bzr-cat-icon shrink-0">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-(--foreground)">
                          <Link href={`/bazaar/c/${category.slug}`} className="hover:underline">
                            {category.name}
                          </Link>
                        </h3>
                        <p className="mt-0.5 text-sm text-(--muted-foreground)">
                          {category.tagline}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-(--muted-foreground)">
                          {count.toLocaleString("en-IN")} live ad{count === 1 ? "" : "s"} ·{" "}
                          {category.subcategories.length} subcategories
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-(--border) pt-3">
                      <div className="bzr-linkcloud">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/bazaar/c/${category.slug}/${sub.slug}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-xs">
                      <Link
                        href={`/bazaar/price-guide/${category.slug}`}
                        className="bzr-section-link"
                      >
                        {category.name} price guide
                      </Link>
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <Note icon={LayoutGrid}>
          Looking for something local instead? Every category also exists per city — start from the{" "}
          <Link href="/bazaar/cities">city directory</Link> and pick a category there.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Keep browsing"
            links={[
              { href: "/bazaar", label: "Bazaar home" },
              { href: "/bazaar/cities", label: "All 50 cities" },
              { href: "/bazaar/price-guide", label: "Price guides" },
              { href: "/bazaar/safety", label: "Safety guide" },
              { href: "/bazaar/help", label: "Help centre" },
              { href: "/bazaar/post", label: "Post a free ad" },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}
