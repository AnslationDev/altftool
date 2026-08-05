import dealData from "../(data)/db.json";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

function findCategory(slug) {
  return (dealData.categories || []).find((category) => category.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = findCategory(slug);

  if (!category) {
    return {
      title: "Deals Category Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${category.categoryName} Deals, Coupons & Offers`,
    // "verified coupons" was the claim here, and on /exclusivedeals/store. No
    // job tests these codes and none of them carries a checked-on date, so the
    // word asserted a process that does not exist. The description now says
    // only what the page does: list the stores and open their current offers.
    description: `Browse ${category.categoryName} stores on AltFTool and open any brand to see the coupon codes, promo codes and deals currently listed for it.`,
    path: `/exclusivedeals/${category.slug}`,
    image: category.image || category.img,
    keywords: [
      `${category.categoryName} deals`,
      `${category.categoryName} coupons`,
      "exclusive deals",
      "AltFTool offers",
    ],
  });
}

/**
 * Layout renders no schema on purpose.
 *
 * The CollectionPage/ItemList/BreadcrumbList block that used to live here ran
 * on every descendant route too, so each /exclusivedeals/<category>/<brand>
 * URL shipped TWO BreadcrumbList nodes — this one ending at the category and
 * the brand layout's ending at the brand — plus a CollectionPage and ItemList
 * describing the parent, all carrying the parent's @id. It now lives in
 * page.jsx so it renders on the category URL only. Verified live before the
 * move: /exclusivedeals/most-popular/boat served BreadcrumbList twice.
 */
export default async function ExclusiveDealsCategoryLayout({ children }) {
  return children;
}
