import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../bazaar.css";
import AdCard from "../../components/AdCard";
import BazaarShell from "../../components/BazaarShell";
import BrowseView from "../../components/BrowseView";
import BuyerChecklist from "../../components/BuyerChecklist";
import ResultsSkeleton from "../../components/ResultsSkeleton";
import { Breadcrumbs, LinkCloud } from "../../components/primitives";
import { TName } from "../../i18n/T";
import { getBuyerGuide } from "../../data/buyerGuides";
import { getCategory, getCategorySlugs } from "../../data/categories";
import { getAllCities, getPopularCities } from "../../data/cities";
import { SORT_OPTIONS, getSubcategoryCounts, queryListings } from "../../data/listings";

/**
 * Category listing — /bazaar/c/<category>
 *
 * Statically generated. A `force-static` page may not read `searchParams`, so
 * the filtering lives in <BrowseView>, a client component that reads the query
 * string itself.
 *
 * <BrowseView> still renders on the SERVER during the static build (with empty
 * search params), so the prerendered HTML already contains the filter rail,
 * the toolbar and the unfiltered first page of real listings — that is what a
 * crawler sees, and no extra copy is needed. Seeding the Suspense fallback
 * with a second grid, which is the obvious thing to reach for, put every card
 * into the HTML twice: 48 card elements for 24 unique items on this page,
 * against 24/24 on /bazaar/in/[city]. Hence `fallback={null}`.
 */

export const dynamic = "force-static";
export const revalidate = 3600;

const PER_PAGE = 24;

/**
 * How many of the category's ads travel to the client for filtering.
 *
 * 96 is four pages and comfortably inside the 1 MiB prerender budget (~1.2 KB
 * of JSON per ad). It is also above the size of every category in the demo
 * corpus, so the client-side filter sees the whole category in practice. A
 * real backend would page this server-side and this constant would not exist.
 */
const CLIENT_POOL_SIZE = 96;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    return createPageMetadata({
      title: "Category not found",
      path: `/bazaar/c/${slug}`,
      noindex: true,
    });
  }

  const { total } = queryListings({ category: category.slug, perPage: 1 });

  return createPageMetadata({
    title: `Used ${category.name} for Sale - AltF Bazaar`,
    description: `${category.description} Browse ${total.toLocaleString("en-IN")} ${category.name.toLowerCase()} ads, filter by city, price and condition, and contact the seller directly.`,
    path: `/bazaar/c/${category.slug}`,
    // Point at the generated OG route; otherwise the explicit openGraph block
    // createPageMetadata emits outranks the opengraph-image file convention.
    image: `/bazaar/c/${category.slug}/opengraph-image`,
    imageAlt: `${category.name} ads on AltF Bazaar`,
    keywords: [
      `used ${category.name.toLowerCase()}`,
      `second hand ${category.name.toLowerCase()}`,
      `buy ${category.name.toLowerCase()} online`,
      `sell ${category.name.toLowerCase()}`,
      "classifieds india",
    ],
  });
}

export default async function BazaarCategoryPage({ params }) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const path = `/bazaar/c/${category.slug}`;
  // Pre-purchase checklist content for the four high-stakes categories
  // (cars, bikes, mobiles, properties); null for the other twenty.
  const guide = getBuyerGuide(category.slug);
  const pool = queryListings({ category: category.slug, page: 1, perPage: CLIENT_POOL_SIZE });
  const subcategories = getSubcategoryCounts(category.slug);
  const cities = getAllCities().map(({ slug: citySlug, name, localities }) => ({
    slug: citySlug,
    name,
    localities,
  }));

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "AltF Bazaar", path: "/bazaar" },
    { name: category.name, path },
  ];

  const cityLinks = getPopularCities(12).map((city) => ({
    href: `/bazaar/in/${city.slug}/${category.slug}`,
    label: `${category.name} in ${city.name}`,
  }));

  return (
    <>
      <JsonLd
        id={`bazaar-category-${category.slug}`}
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path,
            name: `Used ${category.name} for sale`,
            description: category.description,
          }),
          createItemListJsonLd({
            path,
            name: `${category.name} ads on AltF Bazaar`,
            items: pool.items.slice(0, PER_PAGE).map((listing) => ({
              name: listing.title,
              path: `/bazaar/item/${listing.slug}`,
            })),
          }),
          // Same array <BuyerChecklist> renders below, so the FAQPage node
          // always describes text that is on the page. Null (filtered out by
          // JsonLd) for the twenty categories without a guide — and the only
          // FAQPage node on this page; a second would collide on `#faq`.
          guide ? createFaqJsonLd({ path, questions: guide.faqs }) : null,
        ]}
      />

      <BazaarShell>
        <div className="section-container px-4 pb-16 sm:px-6">
          <Breadcrumbs items={crumbs} />

          <header className="mb-5">
            <h1 className="text-2xl font-bold text-(--foreground) sm:text-3xl">
              Used {category.name} for sale
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-(--muted-foreground)">
              {category.description}
            </p>
          </header>

          {subcategories.length > 0 ? (
            <nav aria-label={`${category.name} subcategories`} className="mb-6">
              <div className="flex flex-wrap gap-2">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/bazaar/c/${category.slug}/${sub.slug}`}
                    className="bzr-chip"
                  >
                    {/* Client leaf: the pill follows the EN/हिन्दी toggle while
                        the page stays force-static — prerendered HTML is en. */}
                    <TName kind="subcategory" slug={sub.slug} fallback={sub.name} />
                    <span className="text-(--muted-foreground)">
                      {sub.count.toLocaleString("en-IN")}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}

          <Suspense fallback={<ResultsSkeleton cards={24} />}>
            <BrowseView
              listings={pool.items}
              poolTotal={pool.total}
              category={category}
              cities={cities}
              sortOptions={SORT_OPTIONS}
              emptyTitle={`No ${category.name.toLowerCase()} match those filters`}
              emptyMessage="Try widening the price range, clearing an attribute filter, or picking a nearby city."
            />
          </Suspense>

          {guide ? <BuyerChecklist guide={guide} /> : null}

          <div className="mt-12 border-t border-(--border) pt-6">
            <LinkCloud
              title={`${category.name} by city`}
              links={[
                ...cityLinks,
                {
                  href: `/bazaar/price-guide/${category.slug}`,
                  label: `${category.name} price guide`,
                },
              ]}
            />
          </div>
        </div>
      </BazaarShell>
    </>
  );
}
