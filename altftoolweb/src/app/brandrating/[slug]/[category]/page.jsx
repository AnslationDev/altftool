import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  return createPageMetadata({
    title: "Brand Comparison & Ratings",
    description:
      "Compare top brands with ratings, features, reviews, and FAQs on AltFTool. Make confident choices with reliable comparison signals.",
    path: `/brandrating/${slug}/${category}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
