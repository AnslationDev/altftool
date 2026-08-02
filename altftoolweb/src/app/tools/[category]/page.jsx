import Link from "next/link";
import ToolsClient from "../ToolsClient";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { notFound, redirect } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";
import {
  formatCategoryLabel,
  getInitialToolCatalog,
  getLegacyCategoryRedirect,
  getToolCatalogCount,
  getToolCategories,
  getToolCategoryCounts,
  getToolCategorySlugs,
  slugifyRouteSegment,
} from "../toolRouteUtils";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * Per-category copy, authored against the real catalogue.
 *
 * Two problems it replaces.
 *
 * 1. A doubled noun. formatCategoryLabel("ai-tools") returns "AI Tools", and
 *    every string on this page appended "Tools" to it again — the title read
 *    "AI Tools Tools - Free Online Utilities", the CollectionPage was named
 *    "AI Tools Tools" and its description read "Free ai tools tools that run
 *    entirely in your browser." Six other labels were merely awkward
 *    ("Converters Tools", "Calculators Tools", "Games Tools"). Nothing here
 *    composes a noun by concatenation any more: `heading` is the display form
 *    and `noun` is the prose form, both authored per category.
 *
 * 2. Near-duplicate descriptions. All 21 non-games categories shared one
 *    121-character template with only the label swapped, so between 86% and
 *    98% of every description was byte-identical to the other twenty. A
 *    description that says nothing the title did not already say earns no
 *    click, and mobile is 84% of this site's search traffic.
 *
 * Every tool named below was verified present in that exact category in
 * toolMetaMap — 151 names checked. Do not add a name here without checking
 * it, and check the category too: Image Compressor, Image Resizer and Image
 * Cropper live in design-color, not image-photo, and Loan EMI Calculator is
 * a business tool, not a finance-calculators one.
 *
 * `{n}` is replaced with the live catalogue count at render time, so the copy
 * cannot drift from the registry. Keep descriptions at 150-158 characters
 * ending in a period: trimMetaDescription passes a sub-160 string that ends
 * in .!? through verbatim and cuts anything else. The margin below 160 is
 * deliberate — it is what lets a count grow a digit without truncating.
 */
const CATEGORY_CONTENT = {
  "ai-tools": {
    heading: "AI Tools",
    noun: "AI tools",
    title: "AI Tools - Free Browser AI Utilities",
    description:
      "{n} free AI tools that run in your browser: background remover, text summarizer, paraphrasing tool, voice to text, PDF summarizer and AI face match.",
  },
  "pdf-documents": {
    heading: "PDF & Document Tools",
    noun: "PDF and document tools",
    title: "PDF & Document Tools - Merge, Split, Convert",
    description:
      "{n} free PDF and document tools: merge, split and compress PDFs, add or remove a password, convert PDF to Word or image, and redact bank statements.",
  },
  "image-photo": {
    heading: "Image & Photo Tools",
    noun: "image and photo tools",
    title: "Image & Photo Tools - Edit Photos Free",
    description:
      "{n} free image and photo tools: image editor, photo upscaler and old-photo restorer, watermark remover, WebP to PNG converter, and a passport photo maker.",
  },
  "video-audio": {
    heading: "Video & Audio Tools",
    noun: "video and audio tools",
    title: "Video & Audio Tools - Trim, Convert, Clean",
    description:
      "{n} free video and audio tools: trim video, pull the audio out of a clip, adjust subtitle timing, remove vocals, normalize loudness and tap out a BPM.",
  },
  "text-writing": {
    heading: "Text & Writing Tools",
    noun: "text and writing tools",
    title: "Text & Writing Tools - Free Online Editors",
    description:
      "{n} free text and writing tools: compare and sort text, count syllables, check readability, find synonyms, reverse or slugify a line, and strip whitespace.",
  },
  converters: {
    heading: "Converters",
    noun: "converters",
    title: "Converters - Free File, Data & Unit Tools",
    description:
      "{n} free online converters for files, data and units: CSV, XML and JSON, Base64 and hex, HEIC to JPG, SRT to VTT, temperature, and Indian area units.",
  },
  generators: {
    heading: "Generators",
    noun: "generators",
    title: "Generators - QR, Invoice, Config & Wishes",
    description:
      "{n} free generators for everyday work: UPI QR codes, invoice and purchase order numbers, DNS and DMARC records, package.json files, and festival wishes.",
  },
  calculators: {
    heading: "Calculators",
    noun: "calculators",
    title: "Calculators - Free Online Math Utilities",
    description:
      "{n} free calculators for math and daily life: fractions and ratios, discounts, algebra and equations, tile and roof area, AC tonnage, and SGPA to percentage.",
  },
  "finance-calculators": {
    heading: "Finance Calculators",
    noun: "finance calculators",
    title: "Finance Calculators - EMI, SIP, GST & Tax",
    description:
      "{n} free finance calculators: car and personal loan EMI, SIP, PPF, EPF and NPS, GST and VAT, CAGR and XIRR, gratuity, retirement, and a tip calculator.",
  },
  "health-calculators": {
    heading: "Health Calculators",
    noun: "health calculators",
    title: "Health Calculators - BMI, TDEE & Macros",
    description:
      "{n} free health calculators: BMI Prime, TDEE and macro split, body fat and lean body mass, one rep max, sleep cycles, and clinical unit converters.",
  },
  "health-fitness": {
    heading: "Health & Fitness Tools",
    noun: "health and fitness tools",
    title: "Health & Fitness Tools - Track and Train",
    description:
      "{n} free health and fitness tools: BMI and BMR calculators, workout planner, HIIT and Tabata timers, sleep calculator, step counter, and a symptom diary.",
  },
  developer: {
    heading: "Developer Tools",
    noun: "developer tools",
    title: "Developer Tools - JSON, JWT, Regex & Diff",
    description:
      "{n} free developer tools that run in your browser: JSON editor and parser, JWT decoder, regex tester, diff checker, SQL formatter, and CSV to JSON.",
  },
  "design-color": {
    heading: "Design & Color Tools",
    noun: "design and color tools",
    title: "Design & Color Tools - Palettes to CSS",
    description:
      "{n} free design and color tools: color picker and conversions, gradient and shadow generators, CSS grid and clamp builders, plus image crop and resize.",
  },
  "marketing-social": {
    heading: "Marketing & Social Tools",
    noun: "marketing and social tools",
    title: "Marketing & Social Tools - SEO & Social",
    description:
      "{n} free marketing and social tools: UTM builder, meta tag generator, Twitter card preview, hashtag organizers, ROAS and CAC calculators, and bio links.",
  },
  "security-privacy": {
    heading: "Security & Privacy Tools",
    noun: "security and privacy tools",
    title: "Security & Privacy Tools - Free & Local",
    description:
      "{n} free security and privacy tools: password generator, 2FA authenticator, text encryptor, PDF password remover, phishing URL X-ray, and PII scrubbers.",
  },
  "education-science": {
    heading: "Education & Science Tools",
    noun: "education and science tools",
    title: "Education & Science Tools - Learn Free",
    description:
      "{n} free education and science tools: flag, capital city and grammar quizzes, typing tutor, flashcard maker, molecule builder, and a citation generator.",
  },
  productivity: {
    heading: "Productivity Tools",
    noun: "productivity tools",
    title: "Productivity Tools - Notes, Timers, Plans",
    description:
      "{n} free productivity tools: online notepad, timers and stopwatch, countdown and weekly planners, link organizer, clipboard history, and chore charts.",
  },
  business: {
    heading: "Business Tools",
    noun: "business tools",
    title: "Business Tools - Invoices, Resumes & HR",
    description:
      "{n} free business tools: invoice generator, resume maker and cover letter builder, GST and EMI calculators, survey and poll makers, and an email validator.",
  },
  lifestyle: {
    heading: "Lifestyle Tools",
    noun: "lifestyle tools",
    title: "Lifestyle Tools - Home, Food & Everyday",
    description:
      "{n} free lifestyle tools for everyday life: unit converter and tip calculator, gift finder, sleep calculator, baby name generator, and a perfect egg timer.",
  },
  fun: {
    heading: "Fun Tools",
    noun: "fun tools",
    title: "Fun Tools - Randomizers, Quizzes & Jokes",
    description:
      "{n} free fun tools for a spare five minutes: coin flip, dice roller, decision wheel, magic 8 ball, joke and roast generators, and reaction time tests.",
  },
  // Games keeps its own title/description in generateMetadata — it is a search
  // vertical of its own — but still needs a heading and noun for the body.
  games: {
    heading: "Games",
    noun: "games",
  },
  other: {
    heading: "Other Tools",
    noun: "uncategorized tools",
    title: "Other Tools - Everything Else, One Page",
    description:
      "The catch-all corner of AltFTool for tools that do not fit another category yet. Right now that is the Interview Question practice tool, and nothing else.",
  },
};

/**
 * Copy for a category, with a safe shape for any slug not authored above.
 *
 * A new canonical category must not fall back into the doubled noun this map
 * exists to remove, so the fallback checks whether the label already ends in
 * "tools" before appending it.
 */
function getCategoryContent(category, label) {
  const authored = Object.hasOwn(CATEGORY_CONTENT, category)
    ? CATEGORY_CONTENT[category]
    : null;
  const labelIsToolPhrase = /\btools?$/i.test(label);
  const heading = authored?.heading || (labelIsToolPhrase ? label : `${label} Tools`);
  const noun =
    authored?.noun ||
    (labelIsToolPhrase ? label.toLowerCase() : `${label.toLowerCase()} tools`);

  return {
    heading,
    noun,
    title: authored?.title || `${heading} - Free Online Utilities`,
    // Deliberately no {n} in the fallback. generateMetadata also runs for the
    // tool slugs and legacy category slugs the page redirects, and those have
    // a catalogue count of 0 — "0 free json editor tools" is a worse thing to
    // ship than a sentence with no number in it.
    description:
      authored?.description ||
      `Free ${noun} on AltFTool that run in the browser, need no sign-up, and work the same on a phone as they do on a desktop.`,
  };
}

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getToolCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;

  // The page calls notFound() for these, but a statically generated notFound()
  // is served with a 200 on this deployment, so the robots directive is what
  // actually keeps them out of the index. Tool slugs and legacy categories are
  // excluded: the page redirects those rather than 404ing.
  // Object.hasOwn, not toolMetaMap[category]: the map inherits from
  // Object.prototype, so /tools/toString and /tools/constructor would read as
  // real tools and slip past this guard.
  if (
    !getToolCategorySlugs().includes(category) &&
    !Object.hasOwn(toolMetaMap, category) &&
    !getLegacyCategoryRedirect(category)
  ) {
    return createPageMetadata({
      title: "Category Not Found",
      description: "This tool category does not exist.",
      path: `/tools/${category}`,
      noindex: true,
    });
  }

  const label = formatCategoryLabel(category);
  const isAll = category === "all";

  // Games is a search vertical of its own ("free online games") — generic
  // "<label> Tools" metadata undersells it badly. /games 301s here, so this
  // page carries the games-hub SEO.
  if (category === "games") {
    // getToolCatalogCount, not getCategoryToolItems().length: that helper caps
    // its list at 100 entries, so once the category passes 100 games it would
    // have kept advertising "100+" forever.
    const gameCount = getToolCatalogCount("games");
    return createPageMetadata({
      // The old description ran to 170 characters and trimMetaDescription cut
      // it back to its first sentence — 87 characters, with every game name
      // ("2048, sudoku, minesweeper…") thrown away. This one fits.
      title: `Free Online Games – Play ${gameCount}+ Browser Games`,
      description: `Play ${gameCount}+ free browser games with no download and no sign-up: 2048, sudoku, minesweeper, solitaire, chess, ludo, snake, tetris and typing speed tests.`,
      path: "/tools/games",
      keywords: [
        "free online games",
        "browser games",
        "puzzle games",
        "arcade games",
        "play games online free",
        "no download games",
      ],
    });
  }

  const content = getCategoryContent(category, label);

  return createPageMetadata({
    title: isAll ? "All Online Tools - Free Browser Microtools" : content.title,
    description: isAll
      ? "Browse every AltFTool microtool in one fast directory, including converters, developer helpers, PDF tools, calculators, media tools, and productivity utilities."
      : content.description.replace("{n}", String(getToolCatalogCount(category))),
    path: `/tools/${category}`,
  });
}

/** Tools belonging to this module (category), as ItemList entries. */
function getCategoryToolItems(category) {
  const isAll = category === "all";
  return Object.entries(toolMetaMap)
    .filter(
      ([, tool]) =>
        isAll ||
        getToolCategories(tool)
          .map(slugifyRouteSegment)
          .includes(slugifyRouteSegment(category)),
    )
    .map(([slug, tool]) => ({
      name: tool.name || slug,
      path: `/tools/all/${slug}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 100);
}

// The same set, uncapped. getCategoryToolItems stays at 100 because an ItemList
// of 500 entries is not a useful entity; this one exists to put a real anchor on
// the page for every tool in the category.
//
// It is the fix for the largest structural SEO problem this site has: of 3,947
// tools, 518 had any inbound crawlable link from a non-tool page and 3,429 had
// none. Tool routes are not prerendered (generateStaticParams returns [] under
// the deferred-prerender flag), so the sitemap was the only way in, and a URL
// whose only referrer is the sitemap accumulates no internal signal — which is
// why a blog post outranks the tool it is written about.
//
// Cost lands where it is cheap: the largest category (Calculators, 503 tools)
// adds roughly 32 KB of HTML, and these category pages are not prerendered on
// Amplify, so this adds nothing to the build artifact.
function getCategoryToolIndex(category) {
  const isAll = category === "all";
  return Object.entries(toolMetaMap)
    .filter(
      ([, tool]) =>
        isAll ||
        getToolCategories(tool)
          .map(slugifyRouteSegment)
          .includes(slugifyRouteSegment(category)),
    )
    .map(([slug, tool]) => ({ name: tool.name || slug, path: `/tools/all/${slug}` }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default async function Page({ params }) {
  const { category } = await params;

  // Own properties only — the map inherits from Object.prototype, so
  // /tools/toString would otherwise redirect to /tools/all/toString.
  if (Object.hasOwn(toolMetaMap, category)) {
    redirect(`/tools/all/${category}`);
  }

  // Legacy free-text category slugs (pre-consolidation taxonomy) → canonical.
  const legacyTarget = getLegacyCategoryRedirect(category);
  if (legacyTarget) {
    redirect(`/tools/${legacyTarget}`);
  }

  // Anything left that is not a real category was rendering a full, indexable,
  // self-canonical page built from the slug itself — /tools/asdfgh served
  // "Asdfgh Tools - Free Online Utilities" with robots index,follow. That is an
  // unbounded crawl trap: every typo or spam link mints another indexable URL.
  // The list is the same one generateStaticParams uses, so a slug missing from
  // it has no tools and the page would have been empty regardless.
  if (!getToolCategorySlugs().includes(category)) {
    notFound();
  }

  const label = formatCategoryLabel(category);
  const isAll = category === "all";
  const path = `/tools/${category}`;
  const items = getCategoryToolItems(category);
  const toolIndex = getCategoryToolIndex(category);
  // Same source the metadata uses, so the page body and the <head> can never
  // describe the category differently.
  const { heading, noun } = getCategoryContent(category, label);

  return (
    <>
      {/* Module entity: CollectionPage + ItemList + Breadcrumb, all linked to
          the Organization/WebSite graph (Entity SEO: Website → Module → Tool). */}
      <JsonLd
        id={`tools-category-schema-${category}`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: isAll ? "All Online Tools" : heading,
            description: isAll
              ? "Directory of every free AltFTool browser tool."
              : `Free ${noun} that run entirely in your browser.`,
          }),
          createItemListJsonLd({
            path,
            name: isAll ? "AltFTool tools" : `${heading} on AltFTool`,
            items,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: isAll ? "All Tools" : label, path },
          ]),
        ]}
      />
      {/* categoryCounts is what keeps the 1,098,526-byte catalogue chunk off
          this route: the sidebar's category list and counts were the only
          thing the client needed the whole map for on load. Twenty-two rows
          against a 226 KB brotli download. */}
      <ToolsClient
        meta={getInitialToolCatalog(category)}
        catalogTotal={getToolCatalogCount("all")}
        categoryCounts={getToolCategoryCounts()}
        category={category}
      />
      {/* Deliberately excluded on /tools/all: 3,947 anchors is ~250 KB of
          HTML for a page where every one of those tools is already one hop
          away through its own category. */}
      {!isAll && toolIndex.length > 0 ? (
        <nav
          aria-label={`All ${noun}`}
          className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6"
        >
          <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">
            {toolIndex.length === 1
              ? `The only tool in ${heading}`
              : `All ${toolIndex.length} ${noun}`}
          </h2>
          <ul className="columns-1 gap-x-8 sm:columns-2 lg:columns-3 xl:columns-4">
            {toolIndex.map((tool) => (
              <li key={tool.path} className="break-inside-avoid">
                <Link
                  href={tool.path}
                  prefetch={false}
                  className="block py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary-text)] hover:underline"
                >
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
