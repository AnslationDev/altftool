import dealData from "../../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { brandSlug, findBrandByUrlKey } from "@/app/exclusivedeals/lib/brandSlug";

function findDeal(slug, id) {
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  // Slug is canonical (see lib/brandSlug.js); numeric ids still resolve so
  // links made while the sitemap advertised ids do not start 404ing.
  const brand = findBrandByUrlKey(category, id);
  return { category, brand };
}

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const { category, brand } = findDeal(slug, id);

  if (!category || !brand) {
    return {
      title: "Deal Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${brand.brandName} Coupons, Promo Codes & Offers`,
    description: brand.about || `Find current ${brand.brandName} deals, coupons, and offers in ${category.categoryName}.`,
    path: `/exclusivedeals/${category.slug}/${brandSlug(brand.brandName || brand.name)}`,
    image: brand.imagedeal || brand.img || brand.brandLogo,
    keywords: [
      `${brand.brandName} coupons`,
      `${brand.brandName} deals`,
      `${category.categoryName} offers`,
      "promo codes",
    ],
  });
}

export default async function ExclusiveDealDetailLayout({ children, params }) {
  const { slug, id } = await params;
  const { category, brand } = findDeal(slug, id);

  if (!category || !brand) return children;

  const path = `/exclusivedeals/${category.slug}/${brandSlug(brand.brandName || brand.name)}`;

  return (
    <>
      <JsonLd
        id={`exclusive-deal-schema-${category.slug}-${brand.id}`}
        data={[
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "@id": `${absoluteUrl(path)}#offers`,
            name: `${brand.brandName} Offers`,
            description: brand.about,
            url: absoluteUrl(path),
          },
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exclusive Deals", path: "/exclusivedeals" },
            { name: category.categoryName, path: `/exclusivedeals/${category.slug}` },
            { name: brand.brandName, path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
