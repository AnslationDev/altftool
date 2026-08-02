import SketchFlow from "./SketchFlowClient";
import {
  DEFAULT_HOME_CONTENT,
  fetchHomeContent,
  resolveMetaTitle,
  seoKeywords,
} from "./lib/homeContent";
import { compactBrandedTitle, createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const content = await fetchHomeContent();
  const seo = content.seo || DEFAULT_HOME_CONTENT.seo;

  return createPageMetadata({
    // The title is editable in Firestore, so it can grow past the SERP limit at
    // any time. compactBrandedTitle keeps whatever it is inside 60 rendered
    // characters (it appends the brand itself, which resolves as an absolute
    // title, so the layout's "%s | AltFTool" template does not add a second).
    title: compactBrandedTitle(resolveMetaTitle(seo), 60),
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
