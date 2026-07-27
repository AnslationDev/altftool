# ALTFTool — GEO + Entity SEO Architecture

**Goal:** Google should understand **AltFTool as a global software brand (an entity)**, not just a website — and over time associate the brand with location entities ("AltFTool India", "AltFTool Bhopal", "AltFTool USA", …) through legitimate Entity SEO and structured data. No keyword stuffing, no doorway pages.

This document covers: (1) the audit of the existing SEO stack, (2) what was implemented and where, (3) how the GEO entity system works and scales to thousands of locations, (4) the file-by-file plan for future phases (geo landing routes, hreflang, etc.).

---

## 1. Audit — existing SEO stack (reused, not duplicated)

The codebase already has a strong foundation. Everything new **extends** it; nothing was re-implemented.

| Area | Where | Status |
|---|---|---|
| Central metadata generator | `src/platform/seo/generateMetadata.js` → `createPageMetadata()` | ✅ Already produces unique title/description/canonical/robots/keywords/alternates/OG/Twitter per page, with hreflang + verification hooks from the admin SEO engine |
| Admin SEO engine (per-URL overrides, fill/force inheritance) | `src/platform/seo/seoConfigSource.js` + `packages/core/src/seo/resolver.js` | ✅ Kept as-is; all new metadata flows through it |
| JSON-LD injection | `src/platform/seo/JsonLd.jsx` | ✅ Reused for all new schema |
| Organization + WebSite (layout-level) | `src/app/layout.jsx` | ⚠️ Was thin — enriched (see §2) |
| Tool pages | `tools/all/[slug]` + `tools/[category]/[slug]` | ✅ SoftwareApplication + HowTo + FAQPage + BreadcrumbList already emitted; enriched + related-tools ItemList added |
| Category (module) pages | `tools/[category]/page.jsx` | ⚠️ Had metadata but **no JSON-LD** → CollectionPage + ItemList + Breadcrumb added |
| Tools hub | `tools/page.jsx` | ⚠️ Same gap → module-hub schema added |
| Blog schema | `createBlogPostingJsonLd()` | ✅ Already excellent (Speakable, citations, interactionStatistic, E-E-A-T author/reviewer) — untouched |
| Server-rendered tool content (FAQ/HowTo/related, crawlable) | `src/app/tools/ToolSeoSection.jsx` | ✅ Already in place |
| robots.txt | `src/app/robots.js` | ✅ Correct (does not block `/_next/static`, blocks only `/api/`, engine-extensible) |
| Sitemap | `src/app/sitemap.js` | ✅ Comprehensive dynamic sitemap (tools, blogs, taxonomies, every module), `revalidate: 3600` |
| Manifest / icons / theme-color | `src/app/manifest.js`, layout | ✅ Present |
| GEO / location entities | — | ❌ **Missing entirely → built new (see §3)** |

---

## 2. What was implemented (this phase)

### 2.1 Enriched Organization entity — `generateMetadata.js` → `createOrganizationJsonLd()`

The single brand node every other schema references via `@id: https://altftool.com/#organization`:

- `name`, `alternateName`, `legalName`, `description`, `url`
- `logo` as a full `ImageObject` (with `@id: …/#logo`)
- `brand` (Brand node) — brand-entity signal
- `sameAs` — all social profiles (existing)
- `knowsAbout` — topical authority list (topics from `siteConfig.knowsAbout`)
- `contactPoint` — customer-support ContactPoint (contact page URL, English + Hindi)
- **`areaServed` — every country in the GEO registry, each disambiguated with its Wikidata URL.** This is the core, non-spam Knowledge Graph signal that associates the brand with location entities.
- Optional KG signals via env (omitted when unset, never faked): `NEXT_PUBLIC_ORG_FOUNDER`, `NEXT_PUBLIC_ORG_FOUNDING_DATE`, `NEXT_PUBLIC_ORG_CONTACT_EMAIL`

### 2.2 Enriched WebSite entity — `createWebsiteJsonLd()`

- `alternateName`, `description` added
- `potentialAction: SearchAction` upgraded to the `EntryPoint`/`urlTemplate` form Google documents for the Sitelinks Search Box
- `publisher → @id #organization` (existing)

### 2.3 Enriched Tool entity — `createToolJsonLd()`

- `@type: ["SoftwareApplication", "WebApplication"]`
- `isAccessibleForFree`, `inLanguage`, `browserRequirements`, `image`, `applicationSubCategory`
- `offers` with `availability: InStock` (price 0 — real, not fake)
- `isPartOf → #website`, `mainEntityOfPage → WebPage` — closes the entity chain
- **No fake `aggregateRating`/`Review`** — Google's policy requires real user ratings; wire them in only when a genuine rating system exists (the builder is the single place to add it later).

### 2.4 GEO entity system (NEW)

**`src/platform/seo/geoLocations.js`** — the location registry (single source of truth):

- 10 countries (India, USA, UK, Canada, Australia, Germany, France, UAE, Singapore, Japan)
- 6 Indian states (MP, UP, Bihar, Maharashtra, Karnataka, Telangana)
- 7 cities (Delhi, Bhopal, Indore, Mumbai, Bengaluru, Hyderabad, Lucknow)
- Every entry: `slug`, `name`, schema.org `type` (Country/State/City), `containedIn` (hierarchy), **Wikipedia + Wikidata URLs** (entity disambiguation), ISO code
- Helpers: `getGeoLocation`, `getAllGeoLocations`, `getGeoCountries`, `getGeoChain` (city → state → country)

**To scale to thousands of locations: add entries to this one file.** Everything below picks them up automatically.

**`src/platform/seo/geoEntities.js`** — reusable GEO schema builders:

| Builder | Produces | Use |
|---|---|---|
| `createPlaceJsonLd(slug)` | `Country`/`State`/`City` node with `sameAs` (Wikipedia+Wikidata) + `containedInPlace` chain | The disambiguated location entity |
| `createAreaServedRef(slug)` | Compact Place reference | Embedding in other nodes |
| `createGeoServiceJsonLd(slug)` | `Service` — "AltFTool free online tools in {Place}", `provider → #organization`, `areaServed → Place` | The honest brand↔location association |
| `createGeoWebPageJsonLd(slug, {path})` | `WebPage` with `about → #organization`, `spatialCoverage → Place`, `isPartOf → #website` | Future geo landing pages |
| `createGeoBreadcrumbJsonLd(slug)` | `BreadcrumbList` following the geographic chain | Future geo landing pages |
| `createGeoToolJsonLd({slug, tool, location})` | Geo-scoped `SoftwareApplication` (only the `Offer` is geo-scoped) | Future `/tools/{tool}-{geo}` pages |
| `buildGeoJsonLdBundle(slug, {path})` | Place chain + Service + WebPage + Breadcrumb in one array | **One call = complete geo page schema** |
| `createGeoPageMetadata(slug, overrides)` | Full Next.js Metadata (unique title/desc/canonical/OG/Twitter) via `createPageMetadata` | **One call = complete geo page metadata** |

### 2.5 Module (category) entities

- `tools/[category]/page.jsx` — now emits `CollectionPage` + `ItemList` (up to 100 tools in the module) + `BreadcrumbList`
- `tools/page.jsx` — the hub now emits `CollectionPage` + `ItemList` of every module (category) + `BreadcrumbList`

### 2.6 Tool page entity relations

- Both tool routes now also emit an `ItemList` of **related tools** (from the existing `getRelatedTools()` scorer) — the Tool→Tool edge of the internal-linking graph, matching the visible "Related tools" section.

### 2.7 The resulting entity graph

```
Organization (#organization) ── areaServed ──→ Country/State/City (Wikidata)
   │  ▲ publisher/provider/about                        ▲
   ▼  │                                                 │ spatialCoverage
WebSite (#website) ── SearchAction (Sitelinks box)      │
   │ isPartOf                                           │
   ▼                                                    │
CollectionPage (/tools, /tools/{module}) ── ItemList ──→ Tools
   ▼
SoftwareApplication+WebApplication (tool) ── ItemList → related Tools
   ├── HowTo (workflow)      ├── FAQPage
   └── BreadcrumbList        └── mainEntityOfPage → WebPage
BlogPosting ── publisher → #organization, Speakable, citations (existing)
Service ("AltFTool in {Place}") ── provider → #organization (geo bundles)
```

Every node references the same `@id`s, so Google reads one connected graph: **Organization → Website → Module → Tool → Blog/FAQ/HowTo**, plus **Organization → Locations**.

---

## 3. How "AltFTool India / Bhopal / USA" gets built — the white-hat way

1. **Now (live with this phase):** the Organization's `areaServed` lists every registry country with Wikidata disambiguation. Google's Knowledge Graph learns "AltFTool serves India, USA, UK, …" from the entity graph itself — zero keyword stuffing.
2. **Ongoing (content, not code):** brand mentions with locations in blogs ("best free PDF tools in India"), social profiles listing service areas, Search Console + Bing Webmaster verification. Entity association compounds over time.
3. **Later (when you want dedicated pages):** ship real geo landing pages that carry genuine value (localized intro, popular tools for that market, local-language notes, currency/format defaults). The system is already programmatic-ready — see §4. **Do not ship thin pages that only swap the city name** — that is the doorway-page pattern Google penalizes.

---

## 4. Programmatic SEO — future geo routes (ready-to-paste template)

When you're ready, create `src/app/locations/[geo]/page.jsx`:

```jsx
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import { getAllGeoSlugs, getGeoLocation } from "@/platform/seo/geoLocations";
import { buildGeoJsonLdBundle, createGeoPageMetadata } from "@/platform/seo/geoEntities";

export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllGeoSlugs().map((geo) => ({ geo }));
}

export async function generateMetadata({ params }) {
  const { geo } = await params;
  return createGeoPageMetadata(geo); // unique title/desc/canonical/OG per location
}

export default async function GeoPage({ params }) {
  const { geo } = await params;
  const location = getGeoLocation(geo);
  if (!location) notFound();

  const path = `/locations/${geo}`;
  return (
    <>
      <JsonLd id={`geo-${geo}`} data={buildGeoJsonLdBundle(geo, { path })} />
      {/* REQUIRED: genuinely useful, location-differentiated content here —
          popular tools for this market, localized guidance, real FAQs.
          Thin name-swapped pages = doorway pages = penalty. */}
    </>
  );
}
```

Then add the routes to the sitemap (one block in `src/app/sitemap.js`):

```js
import { getAllGeoSlugs } from "@/platform/seo/geoLocations";
// inside the sitemap array:
...getAllGeoSlugs().map((geo) => ({ path: `/locations/${geo}`, priority: 0.55 })),
```

Geo-scoped tool pages (`/tools/{tool}-{geo}`) follow the same pattern with `createGeoToolJsonLd()`. **Metadata, canonical, breadcrumbs and schema are all inherited automatically — no core changes.**

---

## 5. File-by-file summary (this phase)

| File | Change |
|---|---|
| `src/platform/seo/geoLocations.js` | **NEW** — location entity registry (23 entries, extensible to thousands) |
| `src/platform/seo/geoEntities.js` | **NEW** — GEO schema + metadata builders, `buildGeoJsonLdBundle`, `createGeoPageMetadata` |
| `src/platform/seo/generateMetadata.js` | Enriched Organization (logo ImageObject, brand, knowsAbout, contactPoint, areaServed, optional founder/foundingDate/email via env), enriched WebSite (EntryPoint SearchAction, alternateName, description), enriched SoftwareApplication (WebApplication dual-type, isAccessibleForFree, isPartOf, mainEntityOfPage, availability) |
| `src/app/tools/page.jsx` | Hub schema: CollectionPage + module ItemList + Breadcrumb |
| `src/app/tools/[category]/page.jsx` | Module schema: CollectionPage + tools ItemList + Breadcrumb |
| `src/app/tools/all/[slug]/page.jsx` | + related-tools ItemList |
| `src/app/tools/[category]/[slug]/page.jsx` | + related-tools ItemList |
| `docs/SEO_GEO_ENTITY_ARCHITECTURE.md` | **NEW** — this document |

Verified: all builders smoke-tested (Organization areaServed = 10 countries; geo bundle for Bhopal emits City→State→Country chain + Service + WebPage + Breadcrumb; full JSON serialization clean).

---

## 6. Roadmap — remaining recommendations (next phases)

1. **Search Console/Bing verification tokens** via the existing admin SEO engine (`verification` is already plumbed through `createPageMetadata`).
2. **Real ratings** — when a rating widget ships, add `aggregateRating` inside `createToolJsonLd()` (one place). Never fake it.
3. **hreflang** — already supported per-URL via the admin engine; when Hindi/regional content exists, emit `en-IN`, `hi-IN` alternates. Don't emit hreflang for pages that don't have language variants.
4. **Image sitemap** — extend `sitemap.js` entries with `images: [...]` (Next.js supports it) for blogs and OG assets.
5. **VideoObject** — add builder when video content ships (`createVideoJsonLd` following the BlogPosting pattern).
6. **Geo landing pages** — §4, only with genuinely differentiated content; start with countries (10 pages), then states, then cities, monitoring Search Console for soft-404/quality signals.
7. **Performance** — Core Web Vitals work is orthogonal; current stack already uses lazy sections (`RouteLazySection`), skeletons, and static generation for tool pages. Audit LCP on tool pages after the ad slots load.
8. **E-E-A-T** — fill `NEXT_PUBLIC_ORG_FOUNDER`, add an About page with the founder entity + `sameAs` to their profiles, and author pages for blog writers (Person schema builder `createPersonJsonLd` already exists).

## Phase 2 (SHIPPED) — Geo landing pages, expanded registry, image sitemap, media schema

**Registry expanded to 141 locations** (`geoLocations.js`, compact table format):
48 countries, 24 Indian states, 50 Indian cities, 19 world cities. Wikipedia link on every entry; Wikidata QID only where verified (a wrong QID is worse than none — `sameAs` falls back to Wikipedia). To cover more "AltFTool {place}" queries, append one row per place — pages, schema, sitemap all follow automatically.

**Live geo routes:**

- `/locations` — hub page grouping every location (Countries / Indian states / Cities). CollectionPage + ItemList + Breadcrumb schema. No orphan geo pages.
- `/locations/[geo]` — statically generated for all 141 registry entries (`generateStaticParams`), `revalidate: 86400`. Each page carries:
  - Unique metadata via `createGeoPageMetadata()` (title "AltFTool {Place} — Free Online Tools & Utilities", unique description, canonical, OG/Twitter)
  - Full JSON-LD bundle: Place chain (City→State→Country, Wikidata/Wikipedia sameAs) + Service (provider → #organization, areaServed → Place) + WebPage (spatialCoverage) + BreadcrumbList + FAQPage + popular-tools ItemList
  - Real content (anti-doorway): popular tools grid (live links), module/category navigation, location-aware FAQ (native `<details>`, crawlable), related-locations nav (children + siblings — internal linking mesh), visible breadcrumb
  - Premium `--sc-*` theme (light + dark), zero client JS

**Sitemap** (`sitemap.js`): `/locations` + all 141 geo URLs added; **image sitemap** support added (`images` field on entries) and wired for all blog posts (static + Firebase).

**Media schema** (`generateMetadata.js`): `createImageObjectJsonLd()` and `createVideoJsonLd()` (Google-required fields enforced) — ready for blog heroes and future video content.

**hreflang readiness**: `buildLanguageAlternates(path, variants)` — when Hindi/regional URL variants exist, pass them per page; until then pages keep the safe `x-default`/`en` pair. Never emit hreflang for URLs that don't exist.

Verified: SSR smoke test renders `/locations/bhopal` (19KB HTML — h1, JSON-LD, FAQ, related locations all present), 141 static params, correct canonicals, full JSON serialization.

**"AltFTool + koi bhi location" coverage note:** ranking for arbitrary strings can't be forced; coverage grows three ways — (1) the Organization `areaServed` graph teaches Google the brand serves those regions, (2) each `/locations/{place}` page gives Google a landing target for "altftool {place}" queries, (3) Google Autocomplete/entity association compounds as the brand gets impressions. Expand the registry gradually (watch Search Console for quality signals before adding hundreds at once).

## 7. Guardrails (what this system deliberately does NOT do)

- No fake reviews/ratings, no invented addresses or phone numbers (a web brand without physical offices must not emit `LocalBusiness`/`PostalAddress` — that's the fastest way to a manual action).
- No auto-generated thin geo pages; the route template ships in docs, not in `app/`, until real content exists.
- No keyword-stuffed titles; geo metadata composes naturally ("AltFTool India — Free Online Tools & Utilities").
- All optional KG facts (founder, founding date, email) come from env config and are omitted when unset — never hallucinated.
