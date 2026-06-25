import SketchFlow from "./SketchFlowClient";
import { DEFAULT_HOME_CONTENT, fetchHomeContent, seoKeywords } from "./lib/homeContent";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const content = await fetchHomeContent();
  const seo = content.seo || DEFAULT_HOME_CONTENT.seo;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seoKeywords(seo),
    alternates: {
      canonical: "/sketchflow",
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: "/sketchflow",
      siteName: "AltFTool",
      type: "website",
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SketchFlowStandalonePage() {
  const content = await fetchHomeContent();
  return <SketchFlow config={content} />;
}
