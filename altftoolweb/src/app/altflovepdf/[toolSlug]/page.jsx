import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  return createPageMetadata({
    title: "PDF Tool — Convert, Merge, Split & More",
    description:
      "Free online PDF tool. Convert, merge, split, compress, rotate, protect and unlock PDF files securely in your browser.",
    path: `/altflovepdf/${toolSlug}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
