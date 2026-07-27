import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe2, LayoutGrid, MapPin, Sparkles } from "lucide-react";
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
  isDifferentiatedGeo,
} from "@/platform/seo/geoEntities";
import { formatCategoryLabel, getToolCategorySlugs } from "../../tools/toolRouteUtils";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import IndiaHub, { buildIndiaAnswer, buildIndiaHubModel } from "../_components/IndiaHub";
import { INDIA_FAQS } from "../_content/india";
import { CARD, CTA_CLASS, CTA_STYLE, T } from "../_components/tokens";

/**
 * GEO landing page — /locations/[geo]
 *
 * TWO KINDS OF PAGE, ON PURPOSE
 * -----------------------------
 * 1. DIFFERENTIATED (allowlisted in DIFFERENTIATED_GEOS, currently: india).
 *    Hand-written, location-specific content lives in ../_content/{geo}.js and
 *    is rendered by a dedicated component. Indexable, in the sitemap, and the
 *    only place this route emits FAQ/ItemList JSON-LD — because that is the
 *    only place the content behind the schema was actually written.
 *
 * 2. EVERY OTHER LOCATION. A browser tool behaves identically everywhere, so
 *    there is nothing true and distinct to say about 140 places. These pages
 *    stay live and internally linked as directory shortcuts, but they are
 *    `noindex, follow` (set in createGeoPageMetadata) and emit no structured
 *    data. Rendering one template with the place name swapped in and letting
 *    Google index all of it is the doorway pattern this split removes.
 *
 * ADDING A MARKET: write ../_content/{geo}.js, render it here, then add the
 * slug to DIFFERENTIATED_GEOS in src/platform/seo/geoEntities.js.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

/**
 * Cross-section starting points for the non-differentiated pages. Every slug
 * is verified against toolMetaMap at render time; unknown slugs are dropped
 * rather than rendered as dead links.
 */
const POPULAR_TOOL_SLUGS = [
  "text-to-qr-code",
  "image-compressor",
  "pdf-to-word-converter",
  "word-character-counter",
  "age-calculator",
  "bmi-calculator",
  "password-generator",
  "unit-converter",
  "step-counter",
  "base64-to-file",
  "barcode-generator",
  "aspect-ratio-calculator",
];

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllGeoSlugs().map((geo) => ({ geo }));
}

/**
 * Slug → hand-written content. This map is the second half of the promise
 * DIFFERENTIATED_GEOS makes: a slug in the allowlist with no entry here would
 * be an indexable template page, which is exactly what the allowlist exists to
 * prevent. So indexability below is driven by THIS map, not by the allowlist
 * alone — the allowlist can only ever be as permissive as the content that
 * actually exists. Adding a market means adding one entry here and one slug
 * there.
 */
const GEO_CONTENT = {
  india: {
    build: buildIndiaHubModel,
    metadata: ({ toolCount }) => ({
      title: `${siteConfig.name} India — Free GST, Income Tax, EMI & Aadhaar Tools`,
      description: `${toolCount} free India-specific tools: GST and income tax calculators, EMI and SIP planners, PPF and NPS projections, and offline PAN, Aadhaar, GSTIN, IFSC and UPI checkers. Amounts in ₹, no sign-up, nothing uploaded.`,
      keywords: [
        "GST calculator",
        "income tax calculator India",
        "EMI calculator",
        "SIP calculator",
      ],
    }),
    render: (model) => <IndiaHub model={model} />,
    answer: (model) => buildIndiaAnswer(model.toolCount),
    // Schema, and only schema, for content that is visibly on the page.
    faqs: [...INDIA_FAQS],
    itemListName: `${siteConfig.name} tools for India`,
    itemListItems: (model) =>
      model.groups.flatMap((group) =>
        group.tools.map((tool) => ({ name: tool.name, path: `/tools/all/${tool.slug}` })),
      ),
    toolHrefs: (model) =>
      model.groups.flatMap((group) => group.tools.map((tool) => `/tools/all/${tool.slug}`)),
  },
};

/**
 * Hand-written content for a slug, or null. Both conditions must hold: the
 * slug is allowlisted AND the content exists. `hasOwnProperty` keeps a URL
 * segment like "constructor" from resolving to a prototype member.
 */
function getGeoContent(geo) {
  if (!isDifferentiatedGeo(geo)) return null;
  return Object.prototype.hasOwnProperty.call(GEO_CONTENT, geo) ? GEO_CONTENT[geo] : null;
}

export async function generateMetadata({ params }) {
  const { geo } = await params;
  const content = getGeoContent(geo);
  if (content) {
    return createGeoPageMetadata(geo, content.metadata(content.build()));
  }
  // Shared directory template — never indexed, whatever the allowlist says.
  return createGeoPageMetadata(geo, { noindex: true, follow: true });
}

function getPopularTools() {
  return POPULAR_TOOL_SLUGS.map((slug) => [slug, toolMetaMap[slug]]).filter(([, tool]) => tool);
}

export default async function GeoPage({ params }) {
  const { geo } = await params;
  const location = getGeoLocation(geo);
  if (!location) notFound();

  const path = `/locations/${geo}`;
  const chain = getGeoChain(geo);
  const content = getGeoContent(geo);
  const model = content ? content.build() : null;

  const popularTools = model ? [] : getPopularTools();
  const children = getGeoChildren(geo).slice(0, 24);
  const siblings = getGeoSiblings(geo).slice(0, 16);
  const modules = getToolCategorySlugs()
    .filter((slug) => slug !== "all")
    .slice(0, 14);
  const inIndia = chain.some((entry) => entry.slug === "india") && geo !== "india";

  const summary = content
    ? content.answer(model)
    : `${siteConfig.name}'s free tools work in ${location.name} exactly as they do anywhere else: every tool runs inside your own browser, so your location changes nothing about what it does or what it costs. This page is a directory shortcut for visitors in ${location.name} — the tools themselves are the same worldwide.`;

  const relatedItems = getRelatedContentForPreset(
    {
      href: path,
      title: `${siteConfig.name} in ${location.name}`,
      description: summary,
      tags: [location.name, location.type, location.containedIn].filter(Boolean),
      section: "locations",
    },
    "discovery",
    {
      excludeHrefs: content
        ? content.toolHrefs(model)
        : popularTools.map(([slug]) => `/tools/all/${slug}`),
    },
  );

  return (
    <main
      className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-6 sm:px-6 lg:px-8"
      style={{ color: T.ink }}
    >
      {/* Structured data is emitted ONLY for the differentiated location: the
          rest are noindex, and schema without hand-written content behind it
          is exactly what this route was cleaned of. */}
      {content && (
        <JsonLd
          id={`geo-${geo}`}
          data={[
            ...buildGeoJsonLdBundle(geo, {
              path,
              title: content.metadata(model).title,
              description: content.answer(model),
            }),
            createFaqJsonLd({ path, questions: content.faqs }),
            createItemListJsonLd({
              path,
              name: content.itemListName,
              items: content.itemListItems(model),
            }),
          ]}
        />
      )}

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-semibold"
        style={{ color: T.muted }}
      >
        <Link href="/" className="hover:text-(--sc-indigo)">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/locations" className="hover:text-(--sc-indigo)">
          Locations
        </Link>
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

      {content ? (
        content.render(model)
      ) : (
        <>
          {/* Hero — answer first, and honest about what this page is. */}
          <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
            <p
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em]"
              style={{ color: T.indigo }}
            >
              <MapPin size={13} aria-hidden="true" />
              {location.type === "Country"
                ? "Available nationwide"
                : `${location.name}, ${chain[chain.length - 1].name}`}
            </p>
            <h1
              className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: T.ink }}
            >
              {siteConfig.name} in {location.name} — free online tools
            </h1>
            <p
              className="mt-4 max-w-3xl text-sm font-medium leading-relaxed"
              style={{ color: T.ink }}
            >
              {summary}
            </p>
            {inIndia && (
              <p
                className="mt-3 max-w-3xl text-sm font-medium leading-relaxed"
                style={{ color: T.ink }}
              >
                The tools that genuinely differ by country are grouped on the{" "}
                <Link href="/locations/india" className="font-bold text-(--sc-indigo) underline">
                  AltFTool India hub
                </Link>{" "}
                — GST, income tax, EMI, SIP, PPF and NPS, plus PAN, Aadhaar, GSTIN and IFSC
                checkers. State-level differences are handled inside those tools: stamp duty,
                professional tax and land-area units all ask you which state you are in.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/tools/all" className={CTA_CLASS} style={CTA_STYLE}>
                Browse the full tool directory
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
          <section
            className="rounded-[24px] p-5 sm:p-7"
            style={CARD}
            aria-label="Popular starting points"
          >
            <h2
              className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
              style={{ color: T.ink }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: T.grad }}
                aria-hidden="true"
              >
                <Sparkles className="h-4 w-4" strokeWidth={1.9} />
              </span>
              Popular starting points
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map(([slug, tool]) => (
                <li key={slug}>
                  <Link
                    href={`/tools/all/${slug}`}
                    className="group flex h-full flex-col rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                    style={{ backgroundColor: T.tile }}
                  >
                    <span
                      className="text-sm font-extrabold group-hover:text-(--sc-indigo)"
                      style={{ color: T.ink }}
                    >
                      {tool.name || slug}
                    </span>
                    <span
                      className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed"
                      style={{ color: T.muted }}
                    >
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Browse by module */}
          <section
            className="rounded-[24px] p-5 sm:p-7"
            style={CARD}
            aria-label="Browse tool categories"
          >
            <h2
              className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
              style={{ color: T.ink }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                style={{ background: T.grad }}
                aria-hidden="true"
              >
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
        </>
      )}

      {/* Related locations — internal linking, no orphans */}
      {(children.length > 0 || siblings.length > 0) && (
        <nav aria-label="Related locations" className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <h2
            className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
            style={{ color: T.ink }}
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
              style={{ background: T.grad }}
              aria-hidden="true"
            >
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
          No ItemList JSON-LD here: /locations/india already emits its own
          ItemList, whose @id would collide. */}
      <RelatedContentSection embedded title="Explore AltFTool" items={relatedItems} />
    </main>
  );
}
