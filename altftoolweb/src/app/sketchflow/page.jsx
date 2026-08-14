import SketchFlow from "./SketchFlowClient";
import {
  DEFAULT_HOME_CONTENT,
  fetchHomeContent,
  resolveMetaTitle,
  seoKeywords,
} from "./lib/homeContent";
import JsonLd from "@/platform/seo/JsonLd";
import {
  compactBrandedTitle,
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

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
  const seo = content.seo || DEFAULT_HOME_CONTENT.seo;
  const branding = content.branding || DEFAULT_HOME_CONTENT.branding;

  // SoftwareApplication/WebApplication + BreadcrumbList, read from the same
  // fetchHomeContent() document generateMetadata() uses — so an editor changing
  // the title or description in Firestore moves the schema with the snippet
  // instead of leaving the two describing different apps.
  //
  // The name is the app's own branding.appName rather than the (brand-suffixed)
  // meta title, and resolveMetaTitle is NOT reused as the name because
  // compactBrandedTitle can clip it mid-phrase for the 60-char SERP budget.
  //
  // Nothing about ratings, installs or authorship: this route stores scenes in
  // localStorage (settings.storageKey) and has no account, review or download
  // mechanism to produce such a number.
  const toolJsonLd = createToolJsonLd({
    slug: "sketchflow",
    path: "/sketchflow",
    tool: {
      name: branding.appName || DEFAULT_HOME_CONTENT.branding.appName,
      description: seo.metaDescription || DEFAULT_HOME_CONTENT.seo.metaDescription,
      category: ["Design", "Diagramming"],
      topics: ["online whiteboard", "diagram maker", "flowchart tool"],
    },
  });

  return (
    <>
      <JsonLd
        id="sketchflow-schema"
        data={[
          toolJsonLd,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "SketchFlow", path: "/sketchflow" },
          ]),
        ]}
      />
      <SketchFlow config={content} />
    </>
  );
}
