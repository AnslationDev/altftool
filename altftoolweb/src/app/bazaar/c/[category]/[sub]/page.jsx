import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

import "../../../bazaar.css";
import AdCard from "../../../components/AdCard";
import BazaarShell from "../../../components/BazaarShell";
import BrowseView from "../../../components/BrowseView";
import ResultsSkeleton from "../../../components/ResultsSkeleton";
import { Breadcrumbs, LinkCloud } from "../../../components/primitives";
import { getAllCategoryPairs, getCategory, getSubcategory } from "../../../data/categories";
import { getAllCities, getPopularCities } from "../../../data/cities";
import { SORT_OPTIONS, getSubcategoryCounts, queryListings } from "../../../data/listings";

/**
 * Subcategory listing — /bazaar/c/<category>/<sub>
 *
 * Same shape as the category page, pre-filtered to one subcategory. The
 * subcategory is part of the path rather than the query string on purpose:
 * it is a taxonomy node with its own title, description and crawl budget,
 * not a filter a visitor toggles.
 */

export const dynamic = "force-static";
export const revalidate = 3600;

const PER_PAGE = 24;
const CLIENT_POOL_SIZE = 96;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllCategoryPairs().map(({ category, sub }) => ({ category, sub }));
}

export async function generateMetadata({ params }) {
  const { category: categorySlug, sub: subSlug } = await params;
  const category = getCategory(categorySlug);
  const subcategory = getSubcategory(categorySlug, subSlug);

  if (!category || !subcategory) {
    return createPageMetadata({
      title: "Subcategory not found",
      path: `/bazaar/c/${categorySlug}/${subSlug}`,
      noindex: true,
    });
  }

  const { total } = queryListings({
    category: category.slug,
    subcategory: subcategory.slug,
    perPage: 1,
  });

  // Several sub-category names already carry their own intent — "For Rent:
  // Houses & Apartments", "Jobs", "Free & Giveaway". Blindly wrapping them in
  // "Used … for Sale" produced titles like "Used For Rent: Houses &
  // Apartments for Sale". Only add the framing where it actually reads.
  const carriesOwnIntent =
    /^(for |running )/i.test(subcategory.name) ||
    ["jobs", "services", "properties", "free-giveaway", "rentals", "events-tickets"].includes(
      category.slug,
    );
  const title = carriesOwnIntent
    ? `${subcategory.name} - ${category.name} on AltF Bazaar`
    : `Used ${subcategory.name} for Sale - AltF Bazaar`;
  const noun = subcategory.name.toLowerCase();

  return createPageMetadata({
    title,
    description: carriesOwnIntent
      ? `Browse ${total.toLocaleString("en-IN")} ${noun} listings under ${category.name} on AltF Bazaar. Filter by city and price, then contact the lister directly.`
      : `Browse ${total.toLocaleString("en-IN")} used ${noun} ads under ${category.name} on AltF Bazaar. Filter by city, price and condition, then contact the seller directly.`,
    path: `/bazaar/c/${category.slug}/${subcategory.slug}`,
    keywords: carriesOwnIntent
      ? [noun, `${noun} ${category.name.toLowerCase()}`, category.name]
      : [`used ${noun}`, `second hand ${noun}`, `${noun} for sale`, category.name],
  });
}


export default async function BazaarSubcategoryPage({ params }) {
  const { category: categorySlug, sub: subSlug } = await params;
  const category = getCategory(categorySlug);
  const subcategory = getSubcategory(categorySlug, subSlug);

  if (!category || !subcategory) notFound();

  const path = `/bazaar/c/${category.slug}/${subcategory.slug}`;
  const pool = queryListings({
    category: category.slug,
    subcategory: subcategory.slug,
    page: 1,
    perPage: CLIENT_POOL_SIZE,
  });

  const siblings = getSubcategoryCounts(category.slug);
  const cities = getAllCities().map(({ slug: citySlug, name, localities }) => ({
    slug: citySlug,
    name,
    localities,
  }));

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "AltF Bazaar", path: "/bazaar" },
    { name: category.name, path: `/bazaar/c/${category.slug}` },
    { name: subcategory.name, path },
  ];

  const cityLinks = getPopularCities(12).map((city) => ({
    href: `/bazaar/in/${city.slug}/${category.slug}`,
    label: `${category.name} in ${city.name}`,
  }));

  return (
    <>
      <JsonLd
        id={`bazaar-subcategory-${category.slug}-${subcategory.slug}`}
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path,
            name: `Used ${subcategory.name} for sale`,
            description: `Used ${subcategory.name.toLowerCase()} listed under ${category.name} on AltF Bazaar.`,
          }),
          createItemListJsonLd({
            path,
            name: `${subcategory.name} ads on AltF Bazaar`,
            items: pool.items.slice(0, PER_PAGE).map((listing) => ({
              name: listing.title,
              path: `/bazaar/item/${listing.slug}`,
            })),
          }),
        ]}
      />

      <BazaarShell>
        <div className="section-container px-4 pb-16 sm:px-6">
          <Breadcrumbs items={crumbs} />

          <header className="mb-5">
            <h1 className="text-2xl font-bold text-(--foreground) sm:text-3xl">
              Used {subcategory.name} for sale
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-(--muted-foreground)">
              {subcategory.name} listed under{" "}
              <Link href={`/bazaar/c/${category.slug}`} className="underline underline-offset-2">
                {category.name}
              </Link>
              . {category.description}
            </p>
          </header>

          {siblings.length > 1 ? (
            <nav aria-label={`Other ${category.name} subcategories`} className="mb-6">
              <div className="flex flex-wrap gap-2">
                {siblings.map((sibling) => (
                  <Link
                    key={sibling.slug}
                    href={`/bazaar/c/${category.slug}/${sibling.slug}`}
                    className={`bzr-chip${sibling.slug === subcategory.slug ? " is-active" : ""}`}
                    aria-current={sibling.slug === subcategory.slug ? "page" : undefined}
                  >
                    {sibling.name}
                    <span className={sibling.slug === subcategory.slug ? "" : "text-(--muted-foreground)"}>
                      {sibling.count.toLocaleString("en-IN")}
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
              emptyTitle={`No ${subcategory.name.toLowerCase()} match those filters`}
              emptyMessage="Try widening the price range, clearing an attribute filter, or picking a nearby city."
            />
          </Suspense>

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
