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
 * Segment config has to be a literal — Next rejects a call expression here — so
 * this cannot be derived from shouldDeferBulkPrerendering(). It has to be
 * `true` regardless: during a deferred build generateStaticParams returns [],
 * and `false` would then 404 all 64 converters instead of rendering them on
 * demand. Unknown slugs still 404, because getToolBySlug misses and the page
 * calls notFound() below — the closed manifest is enforced there, not here.
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
 * Per-tool SEO: unique title, description, canonical, OG + Twitter tags.
 * @param {{ params: Promise<{ slug: string }> }} ctx
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const title = `${tool.title} Converter`;
  const description = tool.description;
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
