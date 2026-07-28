import { notFound } from "next/navigation";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { CALCULATORS } from "../toolsData";
import { getToolInfo } from "../toolInfo";
import PageView from "./PageView";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 86400;

// Prerender every calculator so crawlers hit a cached page. Amplify builds
// defer the bulk prerender (artifact-size limit) and let ISR fill the cache on
// demand — same guard as /blogs/[slug].
export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return CALCULATORS.map((tool) => ({ toolSlug: tool.slug }));
}

// Only the slugs in CALCULATORS exist. Anything else used to get a title and a
// description built out of the URL segment ("Foo Bar — Free Online Calculator")
// and was served 200 + index,follow with a self-canonical, so /altfcalculators/
// <any string> minted an indexable page for a calculator that does not exist.
function findCalculator(toolSlug) {
  return CALCULATORS.find((item) => item.slug === toolSlug) || null;
}

// 41 of the 103 calculator slugs also exist in the tool corpus, so
// /altfcalculators/<slug> and /tools/all/<slug> were BOTH indexable, BOTH
// self-canonical and carried the same H1 — two of our own URLs splitting the
// signal for head terms (bmi, sip, mortgage, emi…).
//
// /tools/all/<slug> is the platform's single canonical home for a tool entity
// and therefore wins:
//   • /tools/<category>/<slug> already canonicalises there (buildToolMetadata
//     always passes path `/tools/all/<slug>`), and the sitemap deliberately
//     submits only that URL out of the corpus routes;
//   • createToolJsonLd anchors the SoftwareApplication node at
//     `…/tools/all/<slug>#software` with a matching mainEntityOfPage, so the
//     entity already claims that URL as its page;
//   • it is the URL the rest of the site links to (the /tools directory, every
//     /tools/<category> listing, the homepage trending rail and the global
//     nav), and it is the only family that contains EVERY colliding slug —
//     "meme-generator", for instance, is a twin of both /altflovepdf and
//     /deals, so no suite could be a consistent target.
//
// Users still reach this suite from its own hub, so nothing is redirected —
// only the canonical is consolidated. Calculators with no twin (62 of 103)
// stay self-canonical and are untouched.
function resolveCanonicalPath(toolSlug) {
  return Object.hasOwn(toolMetaMap, toolSlug)
    ? `/tools/all/${toolSlug}`
    : `/altfcalculators/${toolSlug}`;
}

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = findCalculator(toolSlug);

  // notFound() still renders a 200 body on this deployment, so the page must
  // also carry noindex — that is what actually keeps the URL out of the index.
  if (!tool) {
    return createPageMetadata({
      title: "Calculator not found",
      description: "This calculator does not exist. Browse the full list of free AltFTool calculators.",
      path: "/altfcalculators",
      canonical: "/altfcalculators",
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: `${tool.name} — Free Online Calculator`,
    // `summary` is the 120-158 char sentence written from this calculator's own
    // info entry. `desc` (the tile label) is far too short to survive as a
    // snippet, so search and answer engines rewrite it from scraped body text.
    description:
      tool.summary ||
      tool.desc ||
      `Use the free ${tool.name} online. Fast, accurate and 100% private — it runs entirely in your browser.`,
    path: `/altfcalculators/${toolSlug}`,
    canonical: resolveCanonicalPath(toolSlug),
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = findCalculator(toolSlug);
  if (!tool) notFound();

  const toolPath = `/altfcalculators/${toolSlug}`;
  // Structured data is built from the SAME hand-written entry that <ToolInfo/>
  // renders on the page (src/app/altfcalculators/info/*.js), so every question,
  // answer and step in the markup is visible to a human on this URL. A
  // calculator with no curated info entry emits neither FAQPage nor HowTo.
  const info = getToolInfo(toolSlug);
  const curatedSteps = Array.isArray(info?.howToUse)
    ? info.howToUse.filter((step) => typeof step === "string" && step.trim())
    : [];
  const curatedFaqs = Array.isArray(info?.faqs)
    ? info.faqs
      .filter((item) => typeof item?.q === "string" && typeof item?.a === "string")
      .map((item) => ({ question: item.q, answer: item.a }))
    : [];

  const relatedItems = getRelatedContent({
    source: {
      href: toolPath,
      title: tool.name,
      description: tool.summary || tool.desc,
      tags: [tool.category, tool.sidebarCategory].filter(Boolean),
      section: "calculators",
    },
    slots: [
      { sections: ["blogs", "top9"], limit: 2 },
      { sections: ["tools", "pdfTools", "imageTools"], limit: 2 },
      { sections: ["experiences", "hubs"], limit: 2, minScore: 0 },
    ],
  });

  return (
    <>
      <JsonLd
        id={`calculator-schema-${toolSlug}`}
        data={[
          curatedSteps.length
            ? createHowToJsonLd({
              path: toolPath,
              name: `How to use the ${tool.name}`,
              description: tool.summary || tool.desc,
              steps: curatedSteps,
            })
            : null,
          curatedFaqs.length
            ? createFaqJsonLd({ path: toolPath, questions: curatedFaqs })
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/altfcalculators" },
            { name: tool.name, path: toolPath },
          ]),
        ]}
      />
      <PageView {...props} />
      <RelatedContentSection
        title="Related tools & guides"
        items={relatedItems}
        path={toolPath}
        jsonLdName="Related tools & guides"
      />
    </>
  );
}
