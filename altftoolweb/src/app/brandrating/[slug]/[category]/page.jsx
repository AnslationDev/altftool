import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

function formatCategoryName(slug) {
  return String(slug || "Brands")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  const categoryName = formatCategoryName(category);

  return createPageMetadata({
    title: `${categoryName} - Best Brands & Ratings | AltFTool`,
    description: `Compare ${categoryName.toLowerCase()} brands, ratings, features, reviews, and FAQs on AltFTool before you choose.`,
    path: `/brandrating/${slug}/${category}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
