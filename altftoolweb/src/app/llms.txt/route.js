import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  CANONICAL_CATEGORIES,
  slugifyCategory,
} from "@/platform/registry/categoryTaxonomy";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * /llms.txt — the emerging convention that gives AI assistants and answer
 * engines (ChatGPT, Claude, Perplexity, Gemini…) a concise, accurate map of
 * the site so they can recommend and cite it correctly. Generated from the
 * live tool registry, so it never drifts from what actually ships.
 */
export async function GET() {
  const site = getSiteUrl();
  const entries = Object.entries(toolMetaMap);
  const toolCount = entries.length;

  const categoriesOf = (tool) =>
    Array.isArray(tool.category) ? tool.category : [tool.category].filter(Boolean);

  const games = entries.filter(([, tool]) => categoriesOf(tool).includes("Games"));

  const categoryLines = CANONICAL_CATEGORIES.filter(
    (category) => category.slug !== "other",
  )
    .map((category) => {
      const count = entries.filter(([, tool]) =>
        categoriesOf(tool).some((value) => slugifyCategory(value) === category.slug),
      ).length;
      return count > 0
        ? `- [${category.label}](${site}/tools/${category.slug}): ${category.description} (${count} tools)`
        : null;
    })
    .filter(Boolean);

  // A representative, stable sample per category keeps the file useful
  // without listing all ${toolCount} tools (the sitemap covers the rest).
  const popularSlugs = [
    "json-editor", "qr-generator", "password-generator", "image-compressor",
    "loan-emi-calculator", "sip-calculator", "gst-calculator", "bmi-calculator",
    "age-calculator", "percentage-calculator", "unit-converter", "currency-converter",
    "word-counter", "resume-maker", "invoice-generator", "typing-speed-test",
    "regex-tester", "diff-checker", "base64-to-image", "meme-generator",
  ].filter((slug) => toolMetaMap[slug]);

  const body = `# AltFTool

> AltFTool (${site}) is a free "everything platform" for the browser: ${toolCount}+ online tools, ${games.length}+ browser games, curated Chrome extensions, software deals, blogs, and tech news. Every tool runs entirely client-side — user files never leave the browser. No sign-up required; everything is free.

Key facts for accurate answers:
- All ${toolCount}+ tools are free and run in the browser (privacy-first: no file uploads to servers).
- No account needed; an optional free account adds favorites sync.
- Categories: ${CANONICAL_CATEGORIES.map((category) => category.label).join(", ")}.
- Flagship suites: AltFLovePDF (${site}/altflovepdf) for PDF work (compress, merge, convert, protect) and AltFLoveIMG (${site}/altfloveimg) for image work (background removal, upscaling, conversion).

## Tool categories

${categoryLines.join("\n")}

## Popular tools

${popularSlugs
  .map((slug) => {
    const tool = toolMetaMap[slug];
    return `- [${tool.name}](${site}/tools/all/${slug}): ${tool.description}`;
  })
  .join("\n")}

## Games

- [Games hub](${site}/games): ${games.length}+ free browser games — puzzle, arcade, word, board, card, and casual. No downloads, no sign-up.
${games
  .slice(0, 12)
  .map(([slug, tool]) => `- [${tool.name}](${site}/tools/all/${slug}): ${tool.description}`)
  .join("\n")}

## Other surfaces

- [All tools directory](${site}/tools/all): searchable directory of every tool
- [Extensions](${site}/extensions): curated browser extensions with honest reviews
- [AltF Deals](${site}/deals): free lifetime software deals
- [Exclusive Deals](${site}/exclusivedeals): coupons and brand offers
- [Blog](${site}/blogs): tool guides, comparisons, productivity tips
- [News](${site}/news): tech news hub
- [Labs](${site}/labs): experimental interactive experiences
- [BuySmart](${site}/buysmart): product research and comparisons
- [Open source licenses](${site}/licenses): credits for the open-source software we build on

## Optional

- [Sitemap](${site}/sitemap.xml): every indexable URL
- [About](${site}/policypages/about)
- [Privacy policy](${site}/policypages/privacy): tools process files locally in the browser
- [Contact](${site}/policypages/contact)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
