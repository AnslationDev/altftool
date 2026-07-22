import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

function formatBrandName(slug) {
  return String(slug || "Brand")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug, category, pdetail } = await params;
  const brandName = formatBrandName(pdetail);

  return createPageMetadata({
    title: `${brandName} Review, Rating & Alternatives | AltFTool`,
    description: `Review ${brandName} ratings, features, comparisons, alternatives, and FAQs on AltFTool before you choose.`,
    path: `/brandrating/${slug}/${category}/${pdetail}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
