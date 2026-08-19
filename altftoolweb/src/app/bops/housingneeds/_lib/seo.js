import { getVertical } from "../_data/verticals";
import { getHnCategory } from "@/app/bops/housingneeds/_data/categories";
import { HN_BASE, HN_BRAND, hnVerticalUrl } from "../_data/site";
import {
  absoluteUrl,
  createArticleJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

/**
 * Per-vertical page metadata.
 *
 * The root layout applies a "%s | AltFTool" title template, so titles here
 * carry no suffix.
 */
export function buildVerticalMetadata(slug) {
  const vertical = getVertical(slug);

  if (!vertical) {
    // Surface the mistake at build time rather than shipping an empty <title>.
    throw new Error(`[housingneeds] buildVerticalMetadata: unknown vertical "${slug}"`);
  }

  return createPageMetadata({
    title: vertical.seo.title,
    description: vertical.seo.description,
    path: hnVerticalUrl(vertical.slug),
    keywords: [
      vertical.name,
      `${vertical.name} guide`,
      `${vertical.name} costs`,
      "home improvement",
    ],
    pageType: "business-ops-guide",
  });
}

/**
 * Metadata for an imported provider lander (roofers, pest-killer, climatech…),
 * looked up from the Housing Needs category registry under /bops.
 */
export function buildServiceMetadata(categorySlug, pageSlug) {
  const category = getHnCategory(categorySlug);
  const page = category?.pages.find((item) => item.slug === pageSlug);

  if (!category || !page) {
    throw new Error(
      `[housingneeds] buildServiceMetadata: unknown service "${categorySlug}/${pageSlug}"`,
    );
  }

  return createPageMetadata({
    title: `${page.name} — ${page.tagline}`,
    description: page.description,
    // Imported provider landers are retained as product-flow previews. They
    // remain navigable in the directory, but must not compete with the
    // editorial HousingNeeds guides or publish unverified provider claims.
    path: page.href,
    canonical: page.href,
    noindex: true,
    follow: true,
    pageType: "business-ops-preview",
  });
}

/**
 * Article JSON-LD for a vertical guide.
 *
 * These pages are long-form editorial guides, so Article is the honest type.
 * Three deliberate omissions:
 *
 *   - No datePublished / dateModified. The content files carry no authored
 *     date, and stamping the build time would be a fabricated freshness
 *     signal. Add real dates to _data/verticals/*.js and pass them through
 *     here if the content ever gains an editorial calendar.
 *   - No named author. There is no real byline in the data, so authorship
 *     stays with the AltFTool Organization entity (createArticleJsonLd's
 *     default) rather than inventing a person.
 *   - No image beyond the site default. The hero photos are remote URLs that
 *     absoluteUrl() would mangle, and a wrong image URL is worse than none.
 *
 * publisher resolves by @id to the single site-wide Organization node, so the
 * guide attaches to the same entity as every other page.
 */
export function buildArticleJsonLd(slug) {
  const vertical = getVertical(slug);
  if (!vertical) return null;

  const article = createArticleJsonLd({
    path: hnVerticalUrl(vertical.slug),
    headline: vertical.seo.title,
    description: vertical.seo.description,
  });
  if (!article) return null;

  return {
    ...article,
    // The same self-contained paragraph the page renders under its h1.
    abstract: vertical.answer || undefined,
    about: { "@type": "Thing", name: vertical.name },
    articleSection: `${HN_BRAND} guides`,
    inLanguage: "en",
    isAccessibleForFree: true,
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
        item: absolute(hnVerticalUrl(vertical.slug)),
      },
    ],
  };
}

function absolute(path) {
  return absoluteUrl(path);
}
