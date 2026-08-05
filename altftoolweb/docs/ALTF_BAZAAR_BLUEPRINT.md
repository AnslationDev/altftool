# AltF Bazaar — blueprint

> A local classifieds marketplace for AltFTool, in the shape of OLX but branded,
> structured and expanded as our own product.
> Status: **UI/UX complete on mock data. No backend.**
> Route root: `/bazaar` · Branch: `claude/work`

---

## 1. The name

**AltF Bazaar** — tagline *"Buy. Sell. Nearby."*

Chosen over "AltF Sell", "AltF Mandi" and "AltF Local" because:

- It sits naturally in the existing family (`AltF Deals`, `AltF Games`, `AltF Calculators`).
- "Bazaar" reads instantly as *local marketplace* to an Indian audience, and carries
  none of the wholesale/agricultural connotation "Mandi" does.
- It does not collide with the two adjacent verticals we already run:

  | Route | What it is |
  |---|---|
  | `/deals` | Affiliate software deals |
  | `/buysmart` | Store coupons and cashback |
  | `/bazaar` | **C2C classifieds — used goods between people** |

---

## 2. Taxonomy

We deliberately ship **more than OLX**, because a directory's crawlable surface is
roughly its category count times its city count.

| | OLX India | AltF Bazaar |
|---|---|---|
| Top-level categories | 12 | **24** |
| Sub-categories | ~66 | **176** |
| Cities | — | **50** |

The 12 that mirror OLX: Cars, Properties, Mobiles, Bikes, Electronics & Appliances,
Jobs, Commercial Vehicles & Spares, Furniture, Fashion, Books/Sports & Hobbies,
Pets, Services.

The 12 that are ours, and why each earns its place:

| Category | Rationale |
|---|---|
| Kids & Baby | Highest-churn resale category there is — outgrown in months, used by 3+ families |
| Gaming & Consoles | Buried under "Electronics" on OLX despite having its own buyers and its own vocabulary (grade, usage hours, thermals) |
| Health & Wellness | Home gym equipment is bulky, local-only, and badly served |
| Industrial & Business | Restaurant kitchens, workshop machinery, running businesses — operator money, not browser money |
| Agriculture & Farming | Tier-2/3 demand OLX under-serves; implements, irrigation, livestock |
| Art & Collectibles | Provenance and authenticity are real filters no general category provides |
| Tools & Hardware | Every renovation ends with leftover material |
| Events & Tickets | Wedding decor and sound systems are rented, not bought |
| Rent Anything | Short-term hire as a first-class listing type, not a hack on top of "for sale" |
| Free & Giveaway | ₹0 listings; drives goodwill and repeat visits |
| Refurbished Store | Seller-graded, warranty-backed stock — the trust tier |
| Travel & Outdoor | Gear that sits in a cupboard 11 months a year |

Each category declares its own `attributes` array (`select` / `range` / `toggle`),
and that **one declaration drives two surfaces**: the filter rail on listing pages and
the details step of the post-ad wizard. Adding a filter is a one-line data change.

---

## 3. Route map

### Browse (indexable)
| Route | Purpose |
|---|---|
| `/bazaar` | Home — categories, spotlight, fresh recommendations, city cloud |
| `/bazaar/c/[category]` | Category listing + filters |
| `/bazaar/c/[category]/[sub]` | Sub-category listing |
| `/bazaar/item/[slug]` | Ad detail |
| `/bazaar/seller/[slug]` | Seller profile |
| `/bazaar/categories` | Full directory — 24 categories, 176 sub-category links |
| `/bazaar/cities` | 50 cities grouped by state |

### GEO (indexable — the long tail)
| Route | Purpose |
|---|---|
| `/bazaar/in/[city]` | Everything for sale in a city |
| `/bazaar/in/[city]/[category]` | "Used cars in Pune" — the money pages |
| `/bazaar/price-guide` | Index |
| `/bazaar/price-guide/[category]` | Median / p25–p75 by city and sub-category |

### Trust (indexable)
`/bazaar/safety` · `/bazaar/help`

### Discovery (indexable)
| Route | Purpose |
|---|---|
| `/bazaar/trending` | Most-listed categories, busiest cities, popular brands, price entry points |

### Personal (`noindex`)
`/bazaar/post` · `/bazaar/my-ads` · `/bazaar/favourites` · `/bazaar/chat` · `/bazaar/search` · `/bazaar/saved-searches` · `/bazaar/compare`

`/bazaar/search` is noindex on purpose: arbitrary filter permutations are exactly the
doorway-page pattern search engines penalise. Category and city pages carry the same
inventory in a curated, finite form and *are* indexed.

---

## 4. SEO / GEO strategy

**City slugs are borrowed, not invented.** `data/cities.js` builds on
`src/platform/seo/geoLocations.js`, so `/bazaar/in/pune` and `/locations/pune`
describe the same place and the site-wide Organization `areaServed` graph stays
consistent.

**The anti-doorway rule.** `src/app/locations/[geo]/page.jsx` carries an explicit
guardrail comment: geo pages must be real directory surfaces, not name-swapped
templates. Bazaar city pages obey it — each renders that city's own listing counts,
its own localities, its own price medians and its own busiest categories. A
city+category pair with zero inventory renders an honest empty surface **and sets
`noindex`**, and `sitemap.js` skips it rather than advertising a thin page.

**Structured data.** `CollectionPage` + `BreadcrumbList` on browse pages; a
hand-written `Product` node with an `Offer` on detail pages; `FAQPage` on city,
safety and help pages; one `ItemList` on `/bazaar/categories`.
Only ever **one `ItemList` per page** — their `@id` is `${url}#item-list` and a
second one collides.

**Internal linking.** The footer link cloud on home, the city/category cross-links on
every geo page, and a `bazaar` entry in `platform/linking/contentGraph.js` so Bazaar
categories surface in related-content bands elsewhere on the site.

---

## 5. Design decisions

**The card is deliberately quiet.** One accent (price), one image, muted meta. A
24-card grid should read as a list of prices and places, not 24 competing boxes.
Promotion is the only element allowed to shout — and it says "Spotlight" or
"Featured" rather than pretending to be organic.

**Filters are URL state.** Every filter, sort and page number lives in the query
string. A filtered view is therefore linkable, shareable, back-button-correct and
crawlable. Nothing filters in component state.

**Cascade trap — fixed at the root.** `bazaar.css` was imported *unlayered*,
while Tailwind's utilities live in the `utilities` layer — and an unlayered
rule beats every layered rule regardless of specificity. Any `bzr-*` class
setting `display` (`.bzr-btn`, `.bzr-chip`, `.bzr-card`, `.bzr-grid`,
`.bzr-cat-tile`, `.bzr-searchbar`) silently **defeated** `hidden` /
`lg:hidden` / `lg:flex` on the same element. It bit twice — the mobile Filters
button and the chat back button both stayed visible on desktop.

The file is now wrapped in `@layer components`, restoring the intended
precedence. Verified at runtime: `<button className="bzr-chip md:hidden">`
computes to `display: none` at 1280px, where it previously did not. Write the
natural thing; no wrapper span needed.

> The sibling stylesheets (`altf-deals.css`, `buysmart-theme.css`) are still
> unlayered and still carry the original trap.

**Theming.** `bazaar.css` follows the `altf-deals.css` pattern exactly: a
`.bazaar-page` root defines local `--bzr-*` vars derived from the global semantic
tokens, a `[data-theme="dark"] .bazaar-page` block re-declares only the vars that
change, and every rule consumes tokens — never raw hex. Light and dark both work
from one stylesheet. A `prefers-reduced-motion` block neutralises every transform.

**Determinism.** There is no `Math.random()` and no `Date.now()` anywhere in the data
layer. Everything derives from a string seed (`data/random.js`). This is not
fastidiousness — `generateStaticParams` must return the same slugs on every build,
`sitemap.js` must not advertise URLs that stop existing, and a client re-render must
not disagree with prerendered HTML. Recency is stored as the integer `postedDaysAgo`
and rendered relatively, so "3 days ago" means the same thing in the HTML and after
hydration.

---

## 6. Data layer

```
src/app/bazaar/data/
├── categories.js   24 categories · 176 sub-categories · filter attributes
├── cities.js       50 cities, borrowed from the site GEO registry, + localities
├── itemNames.js    per-category product name pools + sub-category hints
├── listings.js     720 generated ads + the whole query surface
├── market.js       the market config (₹, en-IN, "India", +91, 30 days) — see §9f
├── sellers.js      240 generated sellers
└── random.js       seeded PRNG — no Math.random, no Date.now
```

Coherence rules baked into the generator, because the alternative is visibly wrong
pages: an electric car cannot be listed as petrol; a "for rent" property cannot carry
a sale listing type; a name pool is filtered by sub-category so a MacBook never
appears under "Fridges"; and price respects the category floor after condition and
age multipliers stack.

**Swapping in a real backend** means replacing `getListings()` and `queryListings()`.
No page component knows how a listing is made.

---

## 7. Images

Listing photos point at `picsum.photos` and render through
`@/components/ui/ManagedImage` — a plain `<img>` with a `src → fallback → transparent
pixel` chain and its own eslint disable. `picsum` is **not** in `next.config.mjs`
`remotePatterns`, so `next/image` would throw at request time; `ManagedImage` is the
repo's existing answer for data-driven remote URLs.

Seller avatars use `i.pravatar.cc`, which **is** allowlisted.

To move to real photos later: put them on an allowlisted host and swap
`ManagedImage` for `next/image` inside `AdCard` and `ItemGallery`. `quality` must be
one of `75`, `78`, `82` — the config allowlists only those three.

---

## 8. Build gates this vertical has to clear

| Gate | Constraint |
|---|---|
| `check-prerender-size.mjs` | Every prerendered page < **1 MiB** of HTML. Cards capped at 24/page; the 720-ad corpus is never serialised into client props |
| `assert-no-server-tool-loader.mjs` | No server-side reference to `toolRuntimeMap` / `toolLoaderResolver` |
| eslint (`core-web-vitals`) | `@next/next/no-img-element` is an **error** — no bare `<img>` |
| Static params | 720 detail pages is too many to prerender; the top ~200 are static, the rest render on demand. Same for the 50×24 city×category cross-product, capped to the ~150 pairs that have inventory |

---

## 9. Page-weight findings (measured on the production build)

**Card projection — fixed.** `AdCard` is a client component, so whatever a
server page passes it is serialised into the RSC payload verbatim. Full
listings were shipping a ~200-character description and 3–7 image URLs into
cards that render neither: `/bazaar/c/properties` carried 402 unique image URLs
to display 24 cards. `toCardListing()` in `data/listings.js` now trims at the
source for every list helper, while `getListing()`/`getListings()` stay full
for the detail page's gallery and `Product` JSON-LD.

> 594 KiB → 515 KiB (−13%) · image URLs 454→132 · descriptions 21.6→0.5 KiB

**Suspense fallback was emitted twice — fixed.**
`/bazaar/c/[category]` and its `[sub]` sibling wrap `<BrowseView>` in
`<Suspense>` because it reads `useSearchParams()` on a `force-static` page.
Seeding that fallback with a grid of real listings — the obvious way to keep
the HTML crawlable — put every card in twice:

| Page | Card elements | Unique items |
|---|---|---|
| `/bazaar/in/mumbai` (no Suspense) | 24 | 24 |
| `/bazaar/c/cars` (grid as fallback) | 48 | **24** |

The insight that resolved it: **`BrowseView` already renders on the server**
during the static build, with empty search params. Its filter rail, toolbar
and first page of listings are in the prerendered HTML regardless — so the
fallback was pure duplication. `fallback={null}` is all that was needed.

> `/bazaar/c/cars` 525 → **462 KiB**, 48 → 24 cards. `c/properties` 565 → 498 KiB.

A first attempt moved the grid out of the boundary behind a
`PreHydrationResults` wrapper; that merely swapped one redundant copy for
another and was reverted. The hidden `<div hidden id="S:n">` containers are
*not* related — `/deals` has them too.

## 9b. Enhancement wave

**Sharing.** Dynamic OG images per listing, category and city
(`opengraph-image.jsx`, following the `blogs/[slug]` pattern). A listing card
leads with the price at 96–132px so it survives a WhatsApp thumbnail. Inside
`ImageResponse` the no-raw-hex rule is deliberately off — satori supports no
CSS variables and only a flexbox subset — and each file says so. No remote
photo is fetched: a picsum failure inside the route would 500 the whole image,
and nobody notices a broken OG until it is already shared.
`ShareSheet` puts WhatsApp first (it is how ads actually circulate in India)
and builds the URL from `absoluteUrl()`, never `window.location`, so what gets
forwarded is the canonical link.

**Return visits.** `recentlyViewed` (capped at 20) and `savedSearches` in the
store; `/bazaar/saved-searches` restores a filter set as a real URL. Saved
searches carry `path` as well as `query`, and their id is
`${path}?${sortedQuery}` so saving the same filters twice is a no-op. Alert
toggles are labelled as demo preferences that send nothing.

**Compare.** Up to 4 ads side by side, in its own store
(`useCompareStore`, key `altf-bazaar-compare-v1`). Highlights are only applied
where "better" is objective — price, km driven, age, year, warranty — and the
page says so, because a highlight is not a recommendation. Price is ranked
only when every ad shares a category *and* a price period; otherwise a cheap
tablet "wins" against three cars. The pinned first column needs
`border-separate`: Chrome ignores `position: sticky` on cells in a
`border-collapse` table.

**Detail depth.** Fullscreen gallery lightbox (portalled, focus-trapped,
swipeable), a report dialog using OLX's real reason keys
(`badContent`/`fraud`/`duplicated`/`sold`/`other`), `PriceInsight` comparing
the ad to the category+city median with an honest "not enough comparable ads"
state below a sample of 5, and `AdFreshness` flagging ads near or past the
30-day life. `PriceInsight` is suppressed for jobs (a salary is not a price)
and free-giveaway (everything is ₹0).

**Answer engines.** `/llms.txt` carries a Bazaar section generated from live
counts, candid that the inventory is generated and the state is
localStorage-only. `data/bazaarSchema.js` centralises the Product/Offer
builders. `priceValidUntil` is deliberately omitted — deriving it needs a
clock, and the corpus stores only relative recency. No Bazaar `SearchAction`
was added: `createWebsiteJsonLd()` already emits one site-wide, and a second
would collide on `@id`.

## 9c. Data-coherence rules

Each of these was a visible bug caught in the UI, not a hypothetical:

| Rule | What it prevented |
|---|---|
| `reconcileBrand` — brand derived from the title, omitted when unmatched | "Mahindra Thar" filed under `brand: Hyundai`, so the Brand filter returned the wrong cars |
| Brand-tier pricing with ~11%/yr depreciation | A ₹45,000 Mahindra Thar beside a ₹6.3L 2005 Baleno |
| `reconcileFuel` — fuel derived from the model | A "Toyota Innova Crysta" listed as **Electric**, sitting next to a real EV in the compare table |
| EVs forced to Automatic | 8 of 19 EVs advertised a manual gearbox |
| Separate rent band for `For rent` / `PG` | 25 of 27 rentals priced from the *sale* band — ₹50 lakh **per month** |
| Sub-category name pools (`SUBCATEGORY_HINTS`) | A MacBook filed under "Fridges" |
| Category price floors | A ₹58 drum kit, a ₹7,500 tractor |


## 9d. Wave 3 — location, language, findability

**Map (`/bazaar/map`, city pages, detail page).** Listings carry deterministic
`coords` — real city-centre coordinates scattered ~6 km and clustered per
locality, because a real classifieds site publishes an area, never an address.
The detail page draws a ~1.4 km ring rather than a pin for the same reason.
Leaflet loads via `next/dynamic` `{ssr:false}` with a same-height skeleton;
OSM tiles carry the ODbL attribution (deliberately unlike flightradar, which
disables it); dark theme inverts only the tile pane so markers keep their
tokens. Overlapping price pills collapse into "×N" stacks (width-aware greedy
bucketing, deterministic, dependency-free) that spread on click.
Notable bugs fixed en route: leaflet's animated zoom deadlocking the controls
(`zoomAnimation={false}`), the mobile Map/List toggle wiping pins via a 0×0
resize, react-leaflet's popup binding racing `openPopup()`, and 480 off-screen
marker nodes at city zoom (viewport cap).

**Search (`data/search.js`).** The naive `includes()` matcher is now a scoring
engine: normalisation with Indian-English folding (`scooty`→scooter,
`bangalore`→bengaluru), AND-across-tokens, bounded-Levenshtein typo tolerance
against a 1,391-term index built from the corpus, and a visible "Showing
results for …" correction. Measured: `ipone` 0→6, `moblie` 0→80,
`refrigirator` 0→18, while `queryListings({category:'cars'})` stayed exactly 74.
Zero-result pages now recover: correction, drop-the-city ("8 ads across all
India"), drop-one-word, closest categories — every count computed, none
guessed. The search bar gained a full ARIA combobox with grouped suggestions.

**Filters.** `select` attributes multi-select via sorted comma URLs
(`?brand=Mahindra,Tata` — comma verified safe against all 53 option lists;
`+` would collide with "4+ BHK"). Live facet counts per option with standard
semantics (own key excluded), zero-yield options disabled, chip-per-value
removal. Single-select URLs unchanged, so old saved searches keep working.

**Hindi.** `i18n/strings.js` (~258 ids, all 24 categories + 176 sub-categories,
loanword-first: मोबाइल not दूरभाष), an EN/हिन्दी toggle persisted in its own
store, and `<T>`/`<TName>` client leaves so server components stay server
components. Server renders `en`; the locale applies after hydration — zero
mismatch. Listing content stays as posted (UGC boundary, stated in the UI).
**hreflang deliberately not emitted**: the locale is client-side, and
alternates pointing at URLs that don't exist as documents is an SEO error.
Legitimate hi-IN SEO needs real `/hi/...` routes — documented as future work.

**Sell side.** Make-an-offer (anchored at 90% of asking, lowball warnings that
inform without blocking, honest firm-price notice), an ad quality score out of
100 that always names the next action ("Add 3 more photos: +15"), and per-ad
analytics that show **genuine zeros with the reason on screen** rather than
fabricated view counts — a trend chart was refused outright because the store
holds no timestamps to build one from.

**Audit (`docs/BAZAAR_A11Y_AUDIT.md`).** Production build, 8 pages × 2 themes
× 2 viewports over raw CDP. Fixed from its findings: the mobile filter sheet
(a fake modal — 45/45 Tabs landed behind it), skip-to-results (195 Tabs to the
first ad → 1), heading skips, badge/CTA/button contrast (worst: 1.74:1 free
badge in dark; 1.81:1 Sell CTA in light — both now dark-ink), muted text on
tinted surfaces, the browse-page CLS (0.22–0.32 at 360px, root-caused to the
`fallback={null}` from §9b and fixed with a space-reserving `ResultsSkeleton`),
and `error.jsx` (leak-tested with a fake secret). Still open, deliberately:
compare-page prefetch weight and render-blocking resources (platform-wide),
and the unlayered `font: inherit` reset in `globals.css` (worked around
locally; the root fix belongs to the site).


## 9e. Wave 4 — hardening

**Unit tests (`data/*.test.mjs`, 28 tests).** `src/app/bazaar/data` is now a
test root; a self-registered `node:module` loader resolves the `@/` alias and
extensionless imports, so plain `node --test` runs the pure data modules.
The suites LOCK the exact corpus numbers — per-category counts, spot canaries,
brand/fuel coherence, price floors, typo corrections, filter unions, facet
partitioning. The header in each file states the contract: if a locked number
changes by itself, that is the bug the suite exists to catch; a deliberate
generator change updates the lock with a provenance comment. The suite paid
for itself immediately: it caught EV-named vehicles escaping the year clamp
("2005 Nexon EV Max" under `suv`) and, underneath, three cars subcategories
drawing whole-car names ("Hyundai Kona Electric" filed under Car Accessories).
Both fixed at the generator; three locks re-locked with provenance.

**Search parity.** `matchesBaseFilters` (the client filter path on static
category pages) now delegates `q` to the same `parseQuery`/`matchListing` the
search page uses — before, `/bazaar/c/mobiles?q=ipone` returned 0 while
`/bazaar/search?q=ipone` returned 6. Verified equal (6/6) after.

**Thumbnails survive reload.** Posted-ad photos were blob URLs that died with
the page. `post/photoStorage.js` downscales to ~144px JPEG data URLs
(~600 KB budget, EXIF-aware decode, white-matte for transparency) and the
wizard persists those, with a verified fallback ladder: full thumbs → halved
thumbs → no images → honest "may not survive a reload". The ladder was proven
by fault injection (budget shrunk, quota packed at four headroom levels) and
the constants grep-verified restored.

**Buyer checklists** on cars/bikes/mobiles/properties: ~3,100 words of
factual Indian process (Forms 29/30 + hypothecation NOC, IMEI/CEIR and
activation-lock checks, RERA/encumbrance/OC), one valid FAQPage node per
page, rendered with native `<details>` — the radix accordion unmounts closed
panels, which would have removed the very content the FAQ schema describes
from the prerendered HTML. Legal/tax items name the check, never a figure.
The seven least-certain claims are listed in the agent report for human review.

**Also:** the `bazaar` route hub now actually renders on the home page
(BuySmart pattern), and the thumbnail flow's seven new strings exist in both
locales.

## 9f. Market config — the data half of "designed for worldwide"

Every India-market ASSUMPTION the interface used to hardcode now lives in one
frozen object in `src/app/bazaar/data/market.js`, read through `getMarket()`:

```js
{ code: "IN", countryName: "India", currency: "INR", currencySymbol: "₹",
  numberLocale: "en-IN", currencyDisplay: "symbol-first",
  freeValue: 0, phonePrefix: "+91", adLifetimeDays: 30 }
```

`getMarket()` is the single seam — there is no setter and no switcher UI.
`formatPrice` in `data/listings.js` derives symbol, digit grouping and symbol
position from it (byte-identical output for India; the unit tests lock the
exact strings). The price-input prefixes (PostAdWizard, MakeOfferDialog), the
filter rail's price unit, the rentals `deposit` attribute unit and the
attribute-unit formatters (compare table, detail page, Product JSON-LD), the
masked phone prefix, the 30-day ad lifetime, and every "All India" /
"across India" whole-country scope label read the config instead of a literal.
Interface strings that named the country or the symbol are now templates —
`home.hero.subtitle` and `filter.allCountry` take `{country}`;
`offer.enterAmount`, `map.minRupee`, `map.maxRupee` and `post.freeFixed` take
`{symbol}` — fed from the config at the call sites.

What deliberately did NOT move: ₹ and "India" inside **content** — buyer
checklists, safety/help prose, category descriptions, price-guide copy, SEO
titles and the Hindi catalogue — because that text is the India market's
content, owned by its content layer, not formatting logic wearing a costume.

## § Adding a market

The honest recipe. A second market is a **content project with a config file**,
not a config flip. In order:

1. **`data/market.js`** — a new frozen config object (currency, symbol,
   `numberLocale`, `currencyDisplay`, country name, phone prefix, ad
   lifetime), and a decision about how `getMarket()` selects it (build-time
   env, host, or route segment — the seam exists; the switch does not).
2. **`data/cities.js`** — a real city registry with coordinates and
   localities. City slugs are borrowed, never invented: every slug must exist
   in the platform GEO registry (`src/platform/seo/geoLocations.js` — its
   `WORLD_CITIES` table already carries non-Indian cities), or `/bazaar/in/*`
   and `/locations/*` stop describing the same places and the site-wide
   `areaServed` graph splits.
3. **`data/listings.js` corpus weights + `data/categories.js` price bands** —
   `CATEGORY_WEIGHT` and every category `priceBand` mirror *Indian*
   classifieds volume and price levels. A new market re-weights them or its
   corpus feels imported. The locked unit tests are per-market numbers and
   re-lock with provenance.
4. **`data/itemNames.js` + `data/sellers.js`** — product name pools, brand
   tiers and seller name pools people there actually buy from and are called.
   The masked-phone mobile prefixes in `ItemActions.jsx` are the same kind of
   content.
5. **`data/buyerGuides.js` and the safety/help pages** — checklists describe
   Indian paperwork (Forms 29/30, IMEI/CEIR, RERA). Another market has its own
   forms, registries and scams; this is research, not translation.
6. **Price-guide and trust copy** — the honesty caveats stay, the examples
   and institutions change.
7. **`i18n/strings.js`** — a locale table per market language. The `hi` table
   is India-market content and writes भारत directly (a `{country}` param fed
   with the ENGLISH country name would render "India के लिए…"); a new market's
   tables name its country in their own words. `LOCALE_HTML_LANG` regional
   tags move with the market too.
8. **`data/search.js` folding table** — `scooty`→scooter, `bangalore`→bengaluru
   are Indian-English foldings; a new market brings its own synonyms and city
   spellings.

What does **not** need touching: components, the filter rail, search, sort,
pagination, the map, compare, the post wizard — they read prices, symbols,
country scope and lifetimes through `getMarket()` and the string catalogue.
Known residue a second market would still hit: count formatting in a handful
of components calls `toLocaleString("en-IN")` directly (interface-locale digit
grouping for counts, not prices), the trending page's `IndianRupee` lucide
glyph is a market-specific icon choice, and the OG images size their price
box against the widest INR rendering. All three are cosmetic, greppable, and
listed here so nobody discovers them in production.

## 10. Known limits

- **No backend.** Saved ads, posted ads and chat live in `localStorage` via zustand.
  Clearing site data clears them. The UI says so.
- **Chat replies are simulated** on a timer and labelled as such.
- **Photos do not upload.** Previews use `URL.createObjectURL`; posting persists
  small JPEG thumbnails in localStorage (wave 4), so my-ads covers survive reloads.
- **Price guides reflect asking prices** in the mock corpus, not transactions. The
  pages state this rather than implying market authority.
- **Phone numbers are masked mock values** derived from the seller id.

---

## 11. Where things are registered

| File | What was added |
|---|---|
| `src/platform/navigation/siteRoutes.js` | `SITE_ROUTES.bazaar*` + a top-level **Bazaar** nav item with a 6-link dropdown, plus a footer entry |
| `src/platform/navigation/publicRouteTaxonomy.js` | `/bazaar` in the `commerce` family — without it every Bazaar URL falls into "More destinations" |
| `src/platform/navigation/routeHubs.js` | `bazaar` hub for `RouteDiscoveryBand` |
| `src/platform/linking/contentGraph.js` | `bazaar` section labels, hub item, and the 24 categories |
| `src/app/sitemap.js` | Static paths + category, sub-category, city, city×category, listing and seller entries |
| `docs/ROUTES.md` | One row in the Public Web table |
