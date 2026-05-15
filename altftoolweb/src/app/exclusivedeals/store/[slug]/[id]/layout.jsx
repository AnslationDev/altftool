import dealData from "../../../(data)/db.json";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

function findStoreOffer(slug, id) {
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  const brand = category?.brands?.find((item) => String(item.id) === String(id));
  return { category, brand };
}

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const { category, brand } = findStoreOffer(slug, id);

  if (!category || !brand) {
    return {
      title: "Store Offer Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${brand.brandName} Store Offer & Coupon Details | AltFTool`,
    description: brand.about || `Review ${brand.brandName} store offers, coupon terms, and savings details on AltFTool.`,
    path: `/exclusivedeals/store/${category.slug}/${brand.id}`,
    image: brand.imagedeal || brand.img || brand.brandLogo,
    keywords: [
      `${brand.brandName} store offer`,
      `${brand.brandName} coupon details`,
      `${category.categoryName} deals`,
    ],
  });
}

export default function ExclusiveStoreOfferLayout({ children }) {
  return children;
}
