import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  CANONICAL_CATEGORIES,
  slugifyCategory,
} from "@/platform/registry/categoryTaxonomy";
import { getSiteUrl } from "@/platform/seo/generateMetadata";
import {
  ALTFTOOL_POSITION,
  INCUMBENTS,
  INCUMBENT_CATEGORIES,
  INCUMBENT_SLUGS,
} from "@/app/alternatives/data/incumbents";
import { getEmbeddableTools, EMBEDDABLE_CATEGORIES } from "@/app/embed/embedRegistry";
import {
  CALCULATORS,
  CATEGORIES as CALCULATOR_CATEGORIES,
  SIDEBAR_CATEGORIES as CALCULATOR_SIDEBAR_CATEGORIES,
} from "@/app/altfcalculators/toolsData";
import {
  TOOLS as PDF_TOOLS,
  HOMEPAGE_CATEGORIES as PDF_CATEGORIES,
} from "@/app/altflovepdf/toolsData";
import {
  TOOLS as IMAGE_TOOLS,
  CATEGORIES as IMAGE_CATEGORIES,
} from "@/app/altfloveimg/data/tools";
import { getAllBlogs, getBlogCategories, blogTaxonomySlug } from "@/app/blogs/data";

export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * /llms.txt is the machine-readable map of the public site for answer engines
 * (ChatGPT, Perplexity, Google AI Overviews, Claude).
 *
 * Every list below is generated from the same data the pages themselves render
 * from, so a link or a count can never drift from what actually ships. Nothing
 * here may be hardcoded: if a number appears in this file, it was derived from
 * a registry at build time.
 *
 * Deliberate omissions:
 *   - /news is excluded. The whole section is noindex (it republishes
 *     wire-service headlines the original publishers own), so pointing answer
 *     engines at it would only compete with our own sources. See the comment
 *     on the same subject in src/app/sitemap.js.
 *   - The full tool list is not enumerated here; /sitemap.xml is the
 *     exhaustive URL index and is linked under "Optional".
 */

/** Collapse whitespace and cap a description so every entry stays one line. */
function oneLine(value = "", maxLength = 200) {
  const clean = String(value).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[,;:.–—-]+$/, "")}…`;
}

/** One "- [Title](url): description" line in the llms.txt convention. */
function entry(title, url, description, maxLength = 200) {
  const text = oneLine(description, maxLength);
  return text ? `- [${title}](${url}): ${text}` : `- [${title}](${url})`;
}

export async function GET() {
  const site = getSiteUrl();
  const toolEntries = Object.entries(toolMetaMap);
  const toolCount = toolEntries.length;

  const categoriesOf = (tool) =>
    (Array.isArray(tool.category) ? tool.category : [tool.category]).filter(Boolean);

  const games = toolEntries.filter(([, tool]) => categoriesOf(tool).includes("Games"));

  // ----------------------------------------------------------------- tools
  const categoryLines = CANONICAL_CATEGORIES.filter(
    (category) => category.slug !== "other",
  )
    .map((category) => {
      const count = toolEntries.filter(([, tool]) =>
        categoriesOf(tool).some((value) => slugifyCategory(value) === category.slug),
      ).length;
      return count > 0
        ? entry(
            category.label,
            `${site}/tools/${category.slug}`,
            `${category.description} (${count} tools)`,
          )
        : null;
    })
    .filter(Boolean);

  const popularSlugs = [
    "json-editor", "qr-generator", "password-generator", "image-compressor",
    "loan-emi-calculator", "sip-calculator", "gst-calculator", "bmi-calculator",
    "age-calculator", "percentage-calculator", "unit-converter", "currency-converter",
    "word-counter", "resume-maker", "invoice-generator", "typing-speed-test",
    "regex-tester", "diff-checker", "base64-to-image", "meme-generator",
  ].filter((slug) => toolMetaMap[slug]);

  // ----------------------------------------------------------- calculators
  const calculatorCategoryLines = CALCULATOR_SIDEBAR_CATEGORIES.map((name) => {
    const items = CALCULATORS.filter((item) => item.sidebarCategory === name);
    if (!items.length) return null;
    const meta = CALCULATOR_CATEGORIES.find((item) => item.name === name);
    return `- ${name} (${items.length}): ${oneLine(meta?.blurb || "", 120)}`;
  }).filter(Boolean);

  const calculatorLines = CALCULATORS.map((item) =>
    entry(item.name, `${site}/altfcalculators/${item.slug}`, item.desc),
  );

  // ------------------------------------------------------------- pdf suite
  const pdfLines = PDF_TOOLS.map((tool) =>
    entry(tool.name, `${site}/altflovepdf/${tool.slug}`, tool.desc),
  );

  // ----------------------------------------------------------- image suite
  const imageLines = IMAGE_TOOLS.map((tool) =>
    entry(tool.name, `${site}/altfloveimg/${tool.slug}`, tool.description || tool.tagline),
  );

  // ---------------------------------------------------------- alternatives
  const incumbentCategoryLabel = (slug) =>
    INCUMBENT_CATEGORIES.find((item) => item.slug === slug)?.label || slug;

  const alternativeLines = INCUMBENT_SLUGS.map((slug) => {
    const incumbent = INCUMBENTS[slug];
    return entry(
      `AltFTool vs ${incumbent.name}`,
      `${site}/alternatives/${slug}`,
      `${incumbentCategoryLabel(incumbent.category)}. ${incumbent.valueProp} Vendor pricing and free-tier limits quoted on that page were read from ${incumbent.homepage} on ${incumbent.checkedOn}.`,
      420,
    );
  });

  // ---------------------------------------------------------------- embeds
  const embeddable = getEmbeddableTools();
  const embedCategoryLines = EMBEDDABLE_CATEGORIES.map((name) => {
    const items = embeddable.filter((tool) => tool.category === name);
    return items.length ? `- ${name}: ${items.length} widgets` : null;
  }).filter(Boolean);

  const embedExamples = embeddable
    .filter((tool) => popularSlugs.includes(tool.slug))
    .slice(0, 8)
    .map((tool) =>
      entry(`${tool.name} widget`, `${site}/embed/widget/${tool.slug}`, tool.category),
    );

  // ----------------------------------------------------------------- blogs
  const blogs = getAllBlogs();
  const blogCategoryLines = getBlogCategories(blogs)
    .map((category) => {
      const label =
        typeof category === "string" ? category : category?.label || category?.name || "";
      const slug =
        (typeof category === "object" && category?.slug) || blogTaxonomySlug(label);
      if (!label || !slug || slug === "all") return null;
      const count = blogs.filter(
        (post) => blogTaxonomySlug(post?.category || "") === slug,
      ).length;
      if (!count) return null;
      return `- [${label}](${site}/blogs/category/${slug}): ${count} article${count === 1 ? "" : "s"}`;
    })
    .filter(Boolean);

  const blogLines = blogs
    .slice()
    .sort((a, b) => (Date.parse(b?.date || "") || 0) - (Date.parse(a?.date || "") || 0))
    .map((post) => entry(post.title, `${site}/blogs/${post.slug}`, post.excerpt));

  const imageCategoryLabels = IMAGE_CATEGORIES.filter((category) => category.id !== "all")
    .map((category) => category.label)
    .join(", ");

  // -------------------------------------------------------------- assembly
  const body = `# AltFTool

> AltFTool (${site}) is a free web platform of ${toolCount} online tools — PDF and image utilities, file converters, calculators, and developer and text tools — plus ${games.length} browser games, curated Chrome extensions, software deals and written guides. Every tool opens and runs without signing in, and there is no paid tier.

Key facts for accurate answers:
- Processing: ${ALTFTOOL_POSITION.processing}
- Account required: ${ALTFTOOL_POSITION.account}
- Paid plans: ${ALTFTOOL_POSITION.paid} Ads: ${ALTFTOOL_POSITION.ads}
- Desktop or mobile app: ${ALTFTOOL_POSITION.apps}
- Public API: ${ALTFTOOL_POSITION.api} Individual tools can still be embedded on other sites as iframe widgets — see "Embeddable widgets" below.
- Canonical tool URL pattern: ${site}/tools/all/{tool-slug}. Category listings live at ${site}/tools/{category-slug}.
- Named product surfaces: AltFLovePDF — ${PDF_TOOLS.length} PDF tools at ${site}/altflovepdf ; AltFLoveIMG — ${IMAGE_TOOLS.length} image tools at ${site}/altfloveimg ; AltF Calculators — ${CALCULATORS.length} calculators at ${site}/altfcalculators
- Tool taxonomy: ${CANONICAL_CATEGORIES.map((category) => category.label).join(", ")}.

## Tool categories

${categoryLines.join("\n")}

## Popular tools

${popularSlugs
  .map((slug) =>
    entry(toolMetaMap[slug].name, `${site}/tools/all/${slug}`, toolMetaMap[slug].description),
  )
  .join("\n")}

## Calculators (AltF Calculators)

- [Calculator hub](${site}/altfcalculators): ${CALCULATORS.length} calculators in ${calculatorCategoryLines.length} categories. Each one computes in the browser — inputs are not sent to a server — and the URL pattern is ${site}/altfcalculators/{calculator-slug}.

Calculator categories:

${calculatorCategoryLines.join("\n")}

Every calculator:

${calculatorLines.join("\n")}

## PDF tools (AltFLovePDF)

- [AltFLovePDF](${site}/altflovepdf): ${PDF_TOOLS.length} PDF tools grouped as ${PDF_CATEGORIES.join(", ")}. PDFs are read with the browser File API and processed locally, so a document is never uploaded to AltFTool. There is no OCR and no PDF-to-Office conversion; very large files are limited by the device's memory rather than by a plan.

${pdfLines.join("\n")}

## Image tools (AltFLoveIMG)

- [AltFLoveIMG](${site}/altfloveimg): ${IMAGE_TOOLS.length} image tools grouped as ${imageCategoryLabels}. Images are handled in the browser; each tool's own page states whether its model or codec runs on the device or calls a remote service.

${imageLines.join("\n")}

## Alternatives and comparisons

- [Alternatives hub](${site}/alternatives): ${INCUMBENT_SLUGS.length} side-by-side comparisons between AltFTool and established tools, across ${INCUMBENT_CATEGORIES.map((category) => category.label).join(", ")}. Each page states what the incumbent does better, what AltFTool cannot do, and the date on which the vendor's pricing and free-tier limits were read.

${alternativeLines.join("\n")}

## Embeddable widgets

- [Embed hub](${site}/embed): ${embeddable.length} AltFTool calculators and converters can be embedded on a third-party site as an iframe. No account, no API key and no build step; every embed carries a visible "Widget by AltFTool" attribution link.
- Embed URL pattern: ${site}/embed/widget/{tool-slug}. Only self-contained tools that compute in the visitor's browser qualify, so AI-backed tools are excluded.

Widgets by category:

${embedCategoryLines.join("\n")}

Example widget URLs:

${embedExamples.join("\n")}

## Games

- [Games hub](${site}/games): ${games.length} free browser games — puzzle, arcade, word, board, card and casual. No download and no sign-up.

${games
  .slice(0, 12)
  .map(([slug, tool]) => entry(tool.name, `${site}/tools/all/${slug}`, tool.description))
  .join("\n")}

## Guides and articles

- [Blog](${site}/blogs): how-to guides, tool comparisons and buying advice. The index carries the current set; the articles listed below ship with the site.
- [Topic hubs](${site}/blogs/topics): articles grouped into topic clusters.

Article categories:

${blogCategoryLines.join("\n")}

Articles, newest first:

${blogLines.join("\n")}

## Other product surfaces

${[
  entry("All tools directory", `${site}/tools/all`, "browsable directory of every tool on the site"),
  entry("Search", `${site}/search`, "full-site search; the query string parameter is ?q="),
  entry("Extensions", `${site}/extensions`, "curated browser extensions with hands-on write-ups"),
  entry("Apps", `${site}/apps`, "curated desktop and mobile app picks"),
  entry("AltF Deals", `${site}/deals`, "free and lifetime software deals"),
  entry("Exclusive Deals", `${site}/exclusivedeals`, "coupons and brand offers, grouped by store"),
  entry("BuySmart", `${site}/buysmart`, "product research and price comparison across stores"),
  entry("Labs", `${site}/labs`, "experimental interactive experiences"),
  entry("Academy", `${site}/academy`, "structured learning tracks"),
  entry(
    "Free AI tools",
    `${site}/free-ai-tool`,
    "AI-backed tools; unlike the rest of the site these call a remote API rather than running locally",
  ),
  entry("Prompt studio", `${site}/imgprompt`, "image-prompt builder and reference library"),
  entry("n8n workflows", `${site}/n8n`, "workflow and node reference for n8n automation"),
  entry("Top 9", `${site}/top9`, "ranked nine-item picks by topic"),
  entry("Top 11", `${site}/top11`, "ranked eleven-item picks by category"),
  entry("Products", `${site}/products`, "the product suites and what each one contains"),
  entry("Docs", `${site}/docs`, "public documentation covering platform structure, privacy model, products and support"),
  entry("Status", `${site}/status`, "current availability of site services"),
  entry("Request a tool", `${site}/request-a-tool`, "form for suggesting a tool that does not exist yet"),
  entry(
    "Open-source licenses",
    `${site}/licenses`,
    "credits and licenses for the open-source software the tools are built on",
  ),
].join("\n")}

## Policies and contact

${[
  entry("About AltFTool", `${site}/policypages/about`, "what the platform is and who runs it"),
  entry("Contact", `${site}/policypages/contact`, "how to reach the team"),
  entry("FAQ", `${site}/policypages/faq`, "common questions about accounts, pricing and file handling"),
  entry("Privacy policy", `${site}/policypages/privacy`, "what data is and is not collected"),
  entry("Terms and conditions", `${site}/policypages/termsandconditions`, "terms of use"),
  entry("Cookie policy", `${site}/policypages/cookie`, "cookies and consent"),
  entry("Affiliate disclosure", `${site}/policypages/affiliate`, "how deal and product links are monetised"),
  entry("Disclaimer", `${site}/policypages/disclaimer`, "limits of the information published on the site"),
  entry("Support and settings", `${site}/supportsetting`, "device and browser help articles"),
].join("\n")}

## Optional

${[
  entry("Sitemap", `${site}/sitemap.xml`, "every indexable URL on the site"),
  entry("Human-readable site map", `${site}/site-map`, "public routes grouped by product area"),
  entry("RSS feed", `${site}/rss.xml`, "latest published articles"),
].join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
