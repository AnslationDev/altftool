/**
 * Browser Session Analyzer — canonical pure-logic surface.
 *
 * `analyzeSession(text)` is deterministic: the same pasted list of URLs always
 * yields the same tabs, the same duplicate count and the same three scores.
 * Everything that touches the DOM (the CSV/JSON/TXT downloads in ./utils/helpers)
 * stays out of this module.
 *
 * Scoring rules, all defined in ./utils/sessionParser.js:
 *   Health  = 100 − 5 per duplicate URL − 10 per malformed URL
 *             − 0.5 per tab above 50 − a further 0.3 per tab above 100,
 *             clamped to 0…100. The 50-tab knee is where Chrome starts
 *             discarding background tabs on a typical 8 GB machine.
 *   Focus   = ((productive − 0.5 × distracting) / total) × 50 + 50, so an
 *             all-productive session scores 100, an even split 50 and an
 *             all-distracting session 25. Productive = Development,
 *             Productivity, Education, Research. Distracting = Entertainment,
 *             Social Media, Shopping, Gaming.
 *   Clutter = duplicates / total × 100 — the share of tabs you already have
 *             open somewhere else.
 *
 * Duplicates are matched on the normalised URL: lower-cased, with the hash,
 * the query string and any trailing slash removed, so `?utm_source=…` copies
 * of the same page collapse together.
 */

export { parseSessionData } from "./utils/sessionParser";
export {
  getDomain,
  getDomainCategory,
  normalizeUrl,
  isLikelyBroken,
  isHttp,
  formatUrl,
  estimateMemory,
} from "./utils/helpers";

/** Health penalty per duplicate URL, in points. */
export const DUPLICATE_PENALTY = 5;
/** Health penalty per malformed / unparseable URL, in points. */
export const BROKEN_PENALTY = 10;
/** Tab count above which the health score starts decaying. */
export const TAB_SOFT_LIMIT = 50;
/** Tab count above which the decay steepens. */
export const TAB_HARD_LIMIT = 100;
/**
 * Rough resident memory per open tab, in MB. Chrome's own task manager puts a
 * typical content-heavy tab in the 40-60 MB band once the renderer, the
 * compositor and the page's own JS heap are counted, so 50 is the midpoint.
 */
export const MB_PER_TAB = 50;
/** Extra MB for a tab running video (YouTube, Netflix) — decoder + buffers. */
export const MB_PER_VIDEO_TAB = 150;

/** Domain categories the focus score treats as work. */
export const PRODUCTIVE_CATEGORIES = ["Development", "Productivity", "Education", "Research"];
/** Domain categories the focus score treats as leisure. */
export const DISTRACTING_CATEGORIES = ["Entertainment", "Social Media", "Shopping", "Gaming"];
