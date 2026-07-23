import { getHousingService } from "../_data/services";

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

  return {
    title: `${page.name} — ${page.tagline}`,
    description: page.description,
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
    alternates: { canonical: page.href },
    openGraph: {
      title: page.name,
      description: page.description,
      url: page.href,
      type: "website",
    },
  };
}
