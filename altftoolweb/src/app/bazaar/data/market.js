/**
 * AltF Bazaar — the market configuration.
 *
 * Every India-specific ASSUMPTION the interface used to hardcode lives here:
 * which currency symbol leads a price, which digit-grouping locale formats it,
 * what the country is called in country-scope copy ("All India"), the phone
 * prefix the masked contact numbers wear, and how long an ad runs before it
 * expires. Components and the data layer read these through `getMarket()` —
 * the single seam — instead of writing `₹`, `en-IN` or `India` inline.
 *
 * WHAT THIS FILE IS NOT
 * ---------------------
 * It is not a market switcher. There is exactly one active market, it is
 * resolved at module load, and nothing in the UI changes it. Standing up a
 * second market is a content project, not a config flip — beyond this object
 * it needs, at minimum:
 *
 *   - a city registry with real coordinates (`data/cities.js` — every slug
 *     must exist in the platform GEO registry, `src/platform/seo/geoLocations.js`,
 *     which already carries a WORLD_CITIES table);
 *   - corpus seed weights and price bands that mirror that market's real
 *     classifieds volume (`data/listings.js` CATEGORY_WEIGHT, per-category
 *     `priceBand`s in `data/categories.js`);
 *   - product name pools and brand tiers people there actually buy
 *     (`data/itemNames.js`, `data/sellers.js`);
 *   - buyer checklists and safety copy for that market's actual paperwork
 *     and scams (`data/buyerGuides.js`, the safety/help pages);
 *   - price-guide and trust copy, and a locale file whose strings name the
 *     market in its own languages (`i18n/strings.js` — the `hi` table is
 *     India-market content and writes भारत directly, exactly as a Spanish
 *     table for a Mexican market would write "México").
 *
 * The honest recipe, file by file, is in
 * `docs/ALTF_BAZAAR_BLUEPRINT.md` § "Adding a market".
 */

/**
 * The active market. Frozen so a consumer cannot quietly fork it at runtime —
 * the corpus, the prerendered HTML and the client must all agree on one
 * market, for the same reason `data/random.js` bans `Math.random()`.
 *
 * @property {string} code             ISO 3166-1 alpha-2 country code.
 * @property {string} countryName      English country name; feeds `{country}`
 *                                     interpolations in the en string catalogue.
 * @property {string} currency         ISO 4217 code (informational; prices in
 *                                     the corpus are plain numbers).
 * @property {string} currencySymbol   What renders next to a price.
 * @property {string} numberLocale     BCP-47 tag for digit grouping —
 *                                     `en-IN` groups ₹4,50,000, not ₹450,000.
 * @property {"symbol-first"|"symbol-last"} currencyDisplay  ₹1,000 vs 1,000₹.
 * @property {number} freeValue        The price meaning "free" in the corpus.
 * @property {string} phonePrefix      International dialling prefix for the
 *                                     masked demo phone numbers.
 * @property {number} adLifetimeDays   Days an ad runs before it expires.
 */
const MARKET = Object.freeze({
  code: "IN",
  countryName: "India",
  currency: "INR",
  currencySymbol: "₹",
  numberLocale: "en-IN",
  currencyDisplay: "symbol-first", // ₹1,000 not 1,000₹
  freeValue: 0,
  phonePrefix: "+91",
  adLifetimeDays: 30,
});

/** The active market. The single seam — there is no setter. */
export function getMarket() {
  return MARKET;
}
