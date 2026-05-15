import dealData from "../../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function findDeal(slug, id) {
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  const brand = category?.brands?.find((item) => String(item.id) === String(id));
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
    title: `${brand.brandName} Coupons, Promo Codes & Offers | AltFTool`,
    description: brand.about || `Find current ${brand.brandName} deals, coupons, and offers in ${category.categoryName}.`,
    path: `/exclusivedeals/${category.slug}/${brand.id}`,
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

  const path = `/exclusivedeals/${category.slug}/${brand.id}`;

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
