import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

/**
 * /siding is a standalone copy of the /bops/housing-services/siding-pros
 * lander — same components, same content. That lander is deliberately noindex
 * (see _lib/metadata.js: these are provider-style conversion pages that must
 * not compete with the editorial Housing Needs guides), and all 39 of its
 * siblings are too. This route was the one that escaped: indexable, submitted
 * in the sitemap, and linked from nothing but /site-map.
 *
 * It presents AltFTool as a licensed siding contractor. It is now noindex and
 * out of the sitemap, matching the lander it duplicates. What the route should
 * be — a demo of the template, redirected to the lander, or removed — is an
 * owner decision recorded in docs/BACKLINK_EXECUTION_KIT.md.
 */
export async function generateMetadata() {
  return createPageMetadata({
    title: "Siding & Exterior Services",
    description:
      "Professional siding and home exterior services: browse project galleries and before-and-after results, read customer reviews and request a free estimate.",
    path: "/siding",
    noindex: true,
    follow: true,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
