import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe2, HelpCircle, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  createFaqJsonLd,
  createItemListJsonLd,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import {
  getAllGeoSlugs,
  getGeoChain,
  getGeoChildren,
  getGeoLocation,
  getGeoSiblings,
} from "@/platform/seo/geoLocations";
import {
  buildGeoJsonLdBundle,
  createGeoPageMetadata,
} from "@/platform/seo/geoEntities";
import { formatCategoryLabel, getToolCategorySlugs } from "../../tools/toolRouteUtils";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

/**
 * GEO landing page — /locations/[geo]
 *
 * Statically generated for every entry in the geo registry
 * (src/platform/seo/geoLocations.js). Metadata, canonical, breadcrumbs and
 * the full JSON-LD entity bundle are inherited automatically from the geo
 * system — adding a location to the registry ships a new page with zero code
 * changes here.
 *
 * Anti-doorway guardrails: the page is a REAL directory surface — popular
 * tools (live links), module hubs, location-aware FAQ and related-location
 * navigation. Content is composed per location type/hierarchy, not a bare
 * city-name swap; everything on the page is functional for a visitor from
 * that location.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const T = {
  card: "var(--sc-card)",
  tile: "var(--sc-tile)",
  ink: "var(--sc-ink)",
  muted: "var(--sc-muted)",
  indigo: "var(--sc-indigo)",
  grad: "linear-gradient(135deg, #6D7BF7 0%, #8B5CF6 100%)",
  shadow: "var(--sc-shadow)",
};
const CARD = { backgroundColor: T.card, boxShadow: T.shadow };

/**
 * Curated shortlist for the "Popular tools" grid. EVERY slug must resolve in
 * toolMetaMap — see getPopularTools(), which no longer backfills from the
 * registry's own key order. It used to, and because `qr-code-generator`,
 * `pdf-to-word` and `word-counter` never existed (the real slugs are
 * `qr-generator`, `pdf-to-word-converter`, `word-character-counter`), all 141
 * location pages advertised "2 Images Swap", "2048 Game" and "2FA
 * Authenticator" as popular tools — in the visible grid and in the ItemList
 * JSON-LD. More entries than the display limit are listed on purpose so a
 * future registry rename degrades to a shorter real list, never to junk.
 */
const POPULAR_TOOL_SLUGS = [
  "qr-generator",
  "image-compressor",
  "pdf-to-word-converter",
  "word-character-counter",
  "age-calculator",
  "bmi-calculator",
  "password-generator",
  "unit-converter",
  "pdf-merger",
  "img-to-pdf",
  "percentage-calculator",
  "aspect-ratio-calculator",
  "pdf-compressor",
  "split-pdf",
  "barcode-generator",
  "base64-to-file",
  "step-counter",
  "text-to-qr-code",
];

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllGeoSlugs().map((geo) => ({ geo }));
}

export async function generateMetadata({ params }) {
  const { geo } = await params;
  return createGeoPageMetadata(geo);
}

function getPopularTools(limit = 12) {
  const picked = [];
  for (const slug of POPULAR_TOOL_SLUGS) {
    if (picked.length >= limit) break;
    if (toolMetaMap[slug]) picked.push([slug, toolMetaMap[slug]]);
  }
  return picked;
}

function buildIntro(location, chain) {
  const parents = chain.slice(1).map((entry) => entry.name);
  const where = parents.length ? `${location.name} (${parents.join(", ")})` : location.name;
  const scope =
    location.type === "Country"
      ? `across ${location.name}`
      : location.type === "State"
        ? `across ${location.name} — from its biggest cities to the smallest towns`
        : `in ${where}`;

  // Accuracy note: "every tool runs in your browser / your files never leave
  // your device" was not true of the whole catalogue — the AI and lookup tools
  // call server APIs. The claim is scoped to the tools it actually holds for.
  return `${siteConfig.name} is a free online toolkit that works instantly ${scope}. No downloads, no sign-up — and the everyday tools do their work inside your browser, so those files stay on your device. Whether you need to compress an image, convert a PDF to Word, generate a QR code, or run a quick calculation, the full ${siteConfig.name} directory is available to everyone in ${location.name} on any phone, tablet, or computer.`;
}

/**
 * These answers ship as FAQPage structured data, so every sentence is a claim
 * Google may surface verbatim. Three of the four originals were not true:
 *
 *  - "most keep working offline once loaded" — the site has no offline mode.
 *    /sw.js is a tombstone worker that unregisters itself and deletes every
 *    cache, and the root layout actively removes stale registrations.
 *  - "nothing is uploaded to a server" — the AI and lookup tools post to
 *    /api/* routes; the claim is now scoped to the tools it holds for.
 *  - "Which tools are most used in {place}?" — the site has no per-location
 *    usage data, so the answer invented a local popularity ranking and then
 *    quietly admitted it was worldwide. Replaced with a question the page can
 *    genuinely answer from its own shortlist.
 */
function buildFaqs(location) {
  return [
    {
      question: `Is ${siteConfig.name} free to use in ${location.name}?`,
      answer: `Yes. Every tool on ${siteConfig.name} is 100% free for users in ${location.name} — no sign-up, no trial limits, and no hidden costs.`,
    },
    {
      question: `Does ${siteConfig.name} work on mobile networks in ${location.name}?`,
      answer: `Yes. The tools are lightweight, browser-based pages that load quickly even on slower mobile connections, and there is no app to install.`,
    },
    {
      question: `Is my data safe when I use ${siteConfig.name} from ${location.name}?`,
      answer: `Mostly yes. The everyday tools — image compression, PDF conversion, QR codes, calculators — process your files inside your own browser and upload nothing. A few, such as the AI utilities, do send your input to a server.`,
    },
    {
      question: `Which ${siteConfig.name} tools should I start with from ${location.name}?`,
      answer: `The shortlist on this page is a good starting point: image compression, PDF to Word, QR codes and calculators cover most everyday jobs. Browse the directory for 100+ more.`,
    },
  ];
}

export default async function GeoPage({ params }) {
  const { geo } = await params;
  const location = getGeoLocation(geo);
  if (!location) notFound();

  const path = `/locations/${geo}`;
  const chain = getGeoChain(geo);
  const popularTools = getPopularTools();
  const children = getGeoChildren(geo).slice(0, 24);
  const siblings = getGeoSiblings(geo).slice(0, 16);
  const faqs = buildFaqs(location);
  const modules = getToolCategorySlugs()
    .filter((slug) => slug !== "all")
    .slice(0, 14);
  const relatedItems = getRelatedContentForPreset(
    {
      href: path,
      title: `${siteConfig.name} in ${location.name}`,
      description: buildIntro(location, chain),
      tags: [location.name, location.type, location.containedIn].filter(Boolean),
      section: "locations",
    },
    "discovery",
    { excludeHrefs: popularTools.map(([slug]) => `/tools/all/${slug}`) },
  );

  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-6 sm:px-6 lg:px-8"
      style={{ color: T.ink }}
    >
      <JsonLd
        id={`geo-${geo}`}
        data={[
          ...buildGeoJsonLdBundle(geo, { path }),
          createFaqJsonLd({ path, questions: faqs }),
          createItemListJsonLd({
            path,
            name: `Popular ${siteConfig.name} tools in ${location.name}`,
            items: popularTools.map(([slug, tool]) => ({
              name: tool.name || slug,
              path: `/tools/all/${slug}`,
            })),
          }),
        ]}
      />

      {/* Breadcrumb (visible, mirrors the BreadcrumbList schema) */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold" style={{ color: T.muted }}>
        <Link href="/" className="hover:text-(--sc-indigo)">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/locations" className="hover:text-(--sc-indigo)">Locations</Link>
        {[...chain].reverse().map((entry) => (
          <span key={entry.slug} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {entry.slug === location.slug ? (
              <span style={{ color: T.ink }}>{entry.name}</span>
            ) : (
              <Link href={`/locations/${entry.slug}`} className="hover:text-(--sc-indigo)">
                {entry.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Hero */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: T.indigo }}>
          <MapPin size={13} aria-hidden="true" />
          {location.type === "Country" ? "Available nationwide" : `${location.name}, ${chain[chain.length - 1].name}`}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: T.ink }}>
          {siteConfig.name} in {location.name} — Free Online Tools
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
          {buildIntro(location, chain)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/tools/all"
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold text-white transition active:opacity-90"
            style={{ background: T.grad, boxShadow: "0 8px 18px rgba(124,92,246,0.30)" }}
          >
            Browse all 100+ tools
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/blogs"
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition hover:text-(--sc-indigo)"
            style={{ backgroundColor: T.tile, color: T.ink }}
          >
            Guides &amp; blogs
          </Link>
        </div>
      </section>

      {/* Popular tools */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD} aria-label={`Popular tools in ${location.name}`}>
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: T.grad }} aria-hidden="true">
            <Sparkles className="h-4 w-4" strokeWidth={1.9} />
          </span>
          Popular tools in {location.name}
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map(([slug, tool]) => (
            <li key={slug}>
              <Link
                href={`/tools/all/${slug}`}
                className="group flex h-full flex-col rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                style={{ backgroundColor: T.tile }}
              >
                <span className="text-sm font-extrabold group-hover:text-(--sc-indigo)" style={{ color: T.ink }}>
                  {tool.name || slug}
                </span>
                <span className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed" style={{ color: T.muted }}>
                  {tool.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Browse by module */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD} aria-label="Browse tool categories">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: T.grad }} aria-hidden="true">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.9} />
          </span>
          Browse by category
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {modules.map((slug) => (
            <li key={slug}>
              <Link
                href={`/tools/${slug}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
                style={{ backgroundColor: T.tile, color: T.ink }}
              >
                {formatCategoryLabel(slug)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD} aria-label="Frequently asked questions">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: T.grad }} aria-hidden="true">
            <HelpCircle className="h-4 w-4" strokeWidth={1.9} />
          </span>
          Frequently asked questions
        </h2>
        <div className="mt-3 space-y-2">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: T.tile }}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-(--sc-ink) transition-colors hover:text-(--sc-indigo) group-open:text-(--sc-indigo) [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="text-lg leading-none transition-transform duration-150 group-open:rotate-45" style={{ color: T.indigo }} aria-hidden="true">+</span>
              </summary>
              <p className="max-w-3xl pt-2 text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related locations — internal linking, no orphans */}
      {(children.length > 0 || siblings.length > 0) && (
        <nav aria-label="Related locations" className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: T.grad }} aria-hidden="true">
              <Globe2 className="h-4 w-4" strokeWidth={1.9} />
            </span>
            {siteConfig.name} in nearby places
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...children, ...siblings].slice(0, 28).map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/locations/${entry.slug}`}
                  className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
                  style={{ backgroundColor: T.tile, color: T.ink }}
                >
                  {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Cross-section discovery band (site-wide internal linking engine).
          No ItemList JSON-LD here: the page already emits its own ItemList
          (popular tools) whose @id would collide. */}
      <RelatedContentSection embedded title="Explore AltFTool" items={relatedItems} />
    </main>
  );
}
