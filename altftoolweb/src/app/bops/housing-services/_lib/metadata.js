import { getHousingService } from "../_data/services";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

/**
 * Metadata for a Housing Services lander, looked up from the registry.
 *
 * These are provider-style conversion pages: navigable in the directory but
 * noindex, so they never compete with the editorial Housing Needs guides.
 */
export function buildHousingServiceMetadata(slug) {
  const page = getHousingService(slug);

  if (!page) {
    throw new Error(`[housing-services] Unknown service "${slug}"`);
  }

  return createPageMetadata({
    title: `${page.name} — ${page.tagline}`,
    description: page.description,
    path: page.href,
    canonical: page.href,
    noindex: true,
    follow: true,
    pageType: "business-ops-preview",
    keywords: [page.name, page.category, "home services"],
  });
}
