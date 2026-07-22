import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, category, pdetail } = await params;
  return createPageMetadata({
    title: "Brand Details, Ratings & Reviews",
    description:
      "Explore detailed brand ratings, features, comparisons, reviews, and FAQs on AltFTool before you choose.",
    path: `/brandrating/${slug}/${category}/${pdetail}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
