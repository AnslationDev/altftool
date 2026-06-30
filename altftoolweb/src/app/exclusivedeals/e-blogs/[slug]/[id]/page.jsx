import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  return createPageMetadata({
    title: "Deals Blog | Exclusive Deals | AltFTool",
    description:
      "Read AltFTool deals blog articles with shopping guides, savings tips, and the latest insights on exclusive offers.",
    path: `/exclusivedeals/e-blogs/${slug}/${id}`,
    type: "article",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
