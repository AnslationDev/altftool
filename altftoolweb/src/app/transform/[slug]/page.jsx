import { notFound } from "next/navigation";
import { getToolBySlug, getToolSlugs } from "../_lib/manifest";
import { buildTransformSeoContent } from "../_lib/transformSeoContent";
import TransformShell from "../_components/TransformShell";
import TransformSidebar from "../_components/TransformSidebar";
import TransformSeoSection from "../_components/TransformSeoSection";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

const TRANSFORM_OG_IMAGE = "/assets/og-default.png";

/**
 * SoftwareApplication node for a converter.
 *
 * createToolJsonLd() in platform/seo hardcodes /tools/{category}/{slug} URLs,
 * so it cannot describe a /transform route — this builds the equivalent node
 * against the correct canonical path instead of forking that helper.
 *
 * @param {import("../_lib/manifest.js").ToolMeta} tool
 * @param {string} path
 */
function createConverterJsonLd(tool, path) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: `${tool.title} Converter`,
    description: tool.description,
    url,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: `${tool.category} converter`,
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    keywords: (tool.keywords || []).join(", "),
    featureList: [
      `Converts ${tool.from} to ${tool.to}`,
      tool.engine === "browser"
        ? "Runs in the browser — input is not uploaded"
        : "Runs on the AltFTool server — input is not stored",
      tool.lib === "custom" ? "Purpose-built converter" : `Powered by ${tool.lib}`,
      "Copy or download the result",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

/**
 * Amplify defers these pages to the first request, so they must override the
 * root layout's connection() call and use on-demand static generation. Without
 * this literal the Amplify runtime attempts a dynamic Server Components render
 * and returns DYNAMIC_SERVER_USAGE for every converter while local `next start`
 * still appears healthy.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * Keep valid manifest slugs available when generateStaticParams returns [].
 * Unknown slugs still 404 through getToolBySlug/notFound below.
 */
export const dynamicParams = true;

/**
 * Amplify rejects the deploy on artifact size, not on compile errors, and each
 * prerendered route costs roughly 650 KB of it. amplify.yml sets
 * ALTFT_DEFER_BULK_PRERENDER=true so these 64 render on first request instead
 * of at build time; local builds without that variable still prerender the lot.
 */
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getToolSlugs().map((slug) => ({ slug }));
}

/**
 * The manifest blurbs run 70-134 characters — over the 70-character floor, but
 * 60 of the 64 sat under 110 and left most of a mobile SERP snippet unused.
 * Rather than rewrite 64 strings in the manifest (which scripts/assert-transform
 * -manifest.mjs validates), each blurb gets ONE closing clause appended, chosen
 * longest-first from the ladder its engine owns.
 *
 * Both ladders only restate what this page already publishes about itself in
 * createConverterJsonLd's featureList above: where the conversion runs, that the
 * input is not kept, that the result copies or downloads, and that it is free.
 */
const DESCRIPTION_MIN = 150;
const DESCRIPTION_MAX = 158;
const DESCRIPTION_CLAUSES = {
  browser: [
    "Runs entirely in your browser, so what you paste is never uploaded, and the result copies or downloads in one click. Free, no signup.",
    "Runs entirely in your browser, so what you paste is never uploaded, and the result copies or downloads in one click.",
    "Runs entirely in your browser, so what you paste is never uploaded. Free, no signup.",
    "Runs in your browser — what you paste is never uploaded. Free, no signup.",
    "Runs in your browser; what you paste is never uploaded. No signup.",
    "Runs in your browser — nothing you paste is uploaded.",
    "Free, and it runs entirely in your browser.",
    "Runs in your browser, free.",
    "Free to use.",
  ],
  server: [
    "Runs on the AltFTool server, which keeps nothing you paste, and the result copies or downloads in one click. Free, no signup.",
    "Runs on the AltFTool server, which keeps nothing you paste, and the result copies or downloads in one click.",
    "Runs on the AltFTool server, which keeps nothing you paste. Free, no signup.",
    "Runs on the AltFTool server and keeps nothing you paste. No signup.",
    "Runs on the AltFTool server; nothing you paste is stored.",
    "Free, with no signup, on the AltFTool server.",
    "Free, with no signup.",
    "Free to use.",
  ],
};

/**
 * @param {import("../_lib/manifest.js").ToolMeta} tool
 * @returns {string} 141-158 characters across the current 64-tool manifest.
 */
function buildToolDescription(tool) {
  let out = String(tool.description || "").trim();
  if (!/[.!?]$/.test(out)) out = `${out}.`;
  if (out.length >= DESCRIPTION_MIN) return out;
  const ladder = DESCRIPTION_CLAUSES[tool.engine] || DESCRIPTION_CLAUSES.server;
  for (const clause of ladder) {
    const next = `${out} ${clause}`;
    if (next.length <= DESCRIPTION_MAX) return next;
  }
  return out;
}

/**
 * Per-tool SEO: unique title, description, canonical, OG + Twitter tags.
 * @param {{ params: Promise<{ slug: string }> }} ctx
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  // An empty object is not "no metadata" — Next falls back to the /transform
  // layout's, so an unknown slug would answer with the hub's title, the hub's
  // canonical and robots "index". Live traffic never reaches here (unknown
  // slugs 308 to /transform), but the component below calls notFound(), and
  // this is what keeps that 404 out of the index if the redirect ever moves.
  if (!tool) {
    return {
      title: "Converter Not Found",
      description: "The requested AltFTool format converter does not exist.",
      alternates: { canonical: `/transform/${slug}` },
      robots: { index: false, follow: true },
    };
  }

  const title = `${tool.title} Converter`;
  const description = buildToolDescription(tool);
  const url = `/transform/${tool.slug}`;

  return {
    title,
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | AltFTool`,
      description,
      url,
      type: "website",
      images: [
        {
          url: TRANSFORM_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${tool.title} converter on AltFTool`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AltFTool`,
      description,
      images: [TRANSFORM_OG_IMAGE],
    },
  };
}

export default async function TransformToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  // Only serialisable fields cross into the client shell.
  const clientTool = {
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    from: tool.from,
    to: tool.to,
    engine: tool.engine,
    lib: tool.lib,
  };

  const path = `/transform/${tool.slug}`;
  const seo = buildTransformSeoContent(tool);
  // Cross-family discovery. The "converter" preset weights sibling converters
  // highest, then adjacent tools and one guide/hub fallback.
  const relatedItems = getRelatedContentForPreset(
    {
      href: path,
      title: tool.title,
      description: tool.description,
      tags: [tool.category, tool.from, tool.to, ...(tool.keywords || [])],
      section: "transform",
    },
    "converter",
  );

  return (
    <>
      {/* Schema describes only what TransformSeoSection actually renders: the
          same steps, and the same FAQs, in the same order. */}
      <JsonLd
        id={`transform-schema-${tool.slug}`}
        data={[
          createConverterJsonLd(tool, path),
          createHowToJsonLd({
            path,
            name: seo.howToName,
            description: seo.answer,
            steps: seo.steps,
          }),
          createFaqJsonLd({ path, questions: seo.faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Transform", path: "/transform" },
            { name: tool.title, path },
          ]),
        ]}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Sidebar navigation */}
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 h-fit">
          <TransformSidebar activeSlug={slug} />
        </div>

        {/* Main workspace + the server-rendered content beneath it */}
        <div className="min-w-0 flex-1">
          <div className="rounded-[28px] border border-(--border) bg-(--card) p-4 shadow-sm sm:p-6 lg:p-8">
            <TransformShell tool={clientTool} />
          </div>

          <TransformSeoSection tool={tool} />

          <RelatedContentSection
            embedded
            className="mt-4"
            title="Related converters & tools"
            description={`More of AltFTool's ${tool.category} and format tooling, and the guides around it.`}
            items={relatedItems}
            path={path}
            jsonLdName={`Content related to ${tool.title}`}
          />
        </div>
      </div>
    </>
  );
}
