import { getVertical } from "../_data/verticals";
import { getHnCategory } from "../_data/categories";
import { HN_BASE, HN_BRAND } from "../_data/site";

/**
 * Per-vertical page metadata.
 *
 * The root layout applies a "%s | AltFTool" title template, so titles here
 * carry no suffix. `robots` is inherited from the module layout (noindex).
 */
export function buildVerticalMetadata(slug) {
  const vertical = getVertical(slug);

  if (!vertical) {
    // Surface the mistake at build time rather than shipping an empty <title>.
    throw new Error(`[housingneeds] buildVerticalMetadata: unknown vertical "${slug}"`);
  }

  return {
    title: vertical.seo.title,
    description: vertical.seo.description,
    alternates: { canonical: `${HN_BASE}/${vertical.slug}` },
    openGraph: {
      title: `${vertical.seo.title} | ${HN_BRAND}`,
      description: vertical.seo.description,
      url: `${HN_BASE}/${vertical.slug}`,
      type: "website",
    },
  };
}

export function buildServiceMetadata(categorySlug, pageSlug) {
  const category = getHnCategory(categorySlug);
  const page = category?.pages.find((item) => item.slug === pageSlug);

  if (!category || !page) {
    throw new Error(
      `[housingneeds] buildServiceMetadata: unknown service "${categorySlug}/${pageSlug}"`,
    );
  }

  return {
    title: `${page.name} — ${page.tagline}`,
    description: page.description,
    // Imported provider landers are retained as product-flow previews. They
    // remain navigable in the directory, but must not compete with the
    // editorial HousingNeeds guides or publish unverified provider claims.
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
    alternates: { canonical: page.href },
    openGraph: {
      title: `${page.name} | ${HN_BRAND}`,
      description: page.description,
      url: page.href,
      type: "website",
    },
  };
}

/**
 * FAQPage JSON-LD for a vertical — 5 Q&As each, rich-result eligible.
 *
 * The answers rendered on the page must match this markup exactly, which they
 * do: both read the same `faqs` array. HnFaq also keeps collapsed answers in
 * the DOM (hidden, not unmounted), so the visible content backs the markup.
 */
export function buildFaqJsonLd(slug) {
  const vertical = getVertical(slug);
  if (!vertical?.faqs?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: vertical.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

/**
 * BreadcrumbList so search results show HousingNeeds > <Vertical> rather than
 * a bare URL.
 */
export function buildBreadcrumbJsonLd(slug) {
  const vertical = getVertical(slug);
  if (!vertical) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: HN_BRAND, item: absolute(HN_BASE) },
      {
        "@type": "ListItem",
        position: 2,
        name: vertical.name,
        item: absolute(`${HN_BASE}/${vertical.slug}`),
      },
    ],
  };
}

function absolute(path) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://altftool.com").replace(/\/+$/, "");
  return `${base}${path}`;
}
