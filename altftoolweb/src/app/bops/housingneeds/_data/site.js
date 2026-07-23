// Module-wide constants for HousingNeeds.
//
// Deliberately contains NO business identity — no company details, phone,
// address, hours, service areas, licence numbers or staff. These pages present
// solution information only; every conversion goes out through `quoteUrl` on
// the individual vertical (see _data/verticals/*.js).

// The verticals live under the Business Ops Housing Needs tree with FLAT
// URLs: /bops/housingneeds/<slug> (page slugs are unique across categories,
// so no category segment is needed). HN_BASE is the hub (dashboard).
export const HN_BASE = "/bops/housingneeds";

/** Public URL for a vertical page, e.g. hnVerticalUrl("roofing") →
 *  /bops/housingneeds/roofing. Single source of truth for every vertical
 *  link, canonical and breadcrumb in the module. */
export function hnVerticalUrl(slug) {
  return `${HN_BASE}/${slug}`;
}

export const HN_BRAND = "HousingNeeds";

export const HN_TAGLINE =
  "Straight answers on home improvement work — what each job involves, what drives the cost, and how to compare your options.";

/**
 * rel for outbound "Get a quote" links.
 *
 * `sponsored` is the correct signal if these point at affiliate or paid partner
 * destinations. If they are plain non-commercial links, drop `sponsored` and
 * leave "noopener noreferrer".
 */
export const QUOTE_LINK_REL = "noopener noreferrer sponsored";

// Until an admin configures a service-specific destination, quote requests use
// the existing AltFTool contact flow instead of sending visitors to a placeholder.
export const HN_QUOTE_BASE = "/policypages/contact";

export function quoteUrlFor(slug) {
  return `${HN_QUOTE_BASE}?topic=housingneeds&service=${encodeURIComponent(slug)}`;
}

export const HN_QUOTE_IS_PLACEHOLDER = false;

/**
 * Shown at the foot of every page. These pages are informational, so this
 * makes the absence of a service provider explicit rather than implied.
 */
export const HN_DISCLAIMER =
  "HousingNeeds publishes general information about home improvement work. It is not a contractor and does not perform, quote, or supervise any of the services described. Typical lifespans and cost factors are industry generalisations — always confirm details with a licensed local professional before making decisions.";
