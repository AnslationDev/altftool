import { createPageMetadata } from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Explore AltFTool brand comparison previews, category guides, and product research in one place.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Brand Comparisons & Rating Guides",
    description: DESCRIPTION,
    path: "/brandrating",
    // The current hub contains sample statistics and promotional examples.
    // Keep it discoverable to users without indexing those claims as facts.
    noindex: true,
    follow: true,
  });
}

export default function BrandRatingLayout({ children }) {
  return children;
}
