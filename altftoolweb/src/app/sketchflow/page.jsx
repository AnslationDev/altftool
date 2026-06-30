import SketchFlow from "./SketchFlowClient";
import { DEFAULT_HOME_CONTENT, fetchHomeContent, seoKeywords } from "./lib/homeContent";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const content = await fetchHomeContent();
  const seo = content.seo || DEFAULT_HOME_CONTENT.seo;

  return createPageMetadata({
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seoKeywords(seo),
    path: "/sketchflow",
    type: "website",
    image: seo.ogImage || undefined,
  });
}

export default async function SketchFlowStandalonePage() {
  const content = await fetchHomeContent();
  return <SketchFlow config={content} />;
}
