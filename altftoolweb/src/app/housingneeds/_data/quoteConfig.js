/**
 * Remote quote-action config for the HousingNeeds verticals.
 *
 * Written by the CMS admin panel at
 *   knaltftooladmin/src/projects/altftool/modules/businessops/
 * The path literal below MUST match HOUSING_NEEDS_DOC_PATH in that module's
 * service file. Both repos declare it independently, which is how the existing
 * sketchflow and tripfindbox integrations work — packages/core exists as two
 * byte-identical copies, so a "shared" helper would have to be added twice.
 *
 * Read over the Firestore REST API rather than the client SDK so this stays
 * usable from a server component. firestore.rules already allows public read
 * on projects/altftool/**, so no credentials beyond the public web API key are
 * involved.
 *
 * Every failure path returns DEFAULT_QUOTE_CONFIG, so an unreachable or
 * misconfigured Firestore degrades to the copy compiled into _data/verticals/*
 * rather than breaking the page.
 */

export const HOUSING_NEEDS_DOC_PATH = [
  "projects",
  "altftool",
  "businessops",
  "data",
  "housingneeds",
  "content",
];

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";

/** No remote overrides — every vertical uses its own compiled-in quote action. */
export const DEFAULT_QUOTE_CONFIG = { verticals: {} };

/**
 * Cache tag for on-demand invalidation. The admin posts this to
 * /api/revalidate after saving, so an edit goes live immediately rather than
 * waiting out the revalidate window below.
 */
export const QUOTE_CONFIG_TAG = "housingneeds-quote-config";

/**
 * Backstop revalidation, in seconds. Deliberately short: this config drives the
 * conversion element on paid landing pages, so a stale value is a real cost.
 * On-demand tag invalidation makes edits appear immediately when the admin's
 * revalidate env vars are configured; this window is what covers the case where
 * they are not.
 */
const REVALIDATE_SECONDS = 60;

/* --------------------------------------------------- Firestore REST decoding */

function decodeValue(value) {
  if (value === null || value === undefined) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields || {});
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeValue);
  return null;
}

function decodeFields(fields) {
  const out = {};
  for (const key of Object.keys(fields)) out[key] = decodeValue(fields[key]);
  return out;
}

export async function fetchQuoteConfig() {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) return DEFAULT_QUOTE_CONFIG;

  const docPath = HOUSING_NEEDS_DOC_PATH.join("/");
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/${docPath}?key=${FIREBASE_API_KEY}`;

  try {
    // Tagged so the admin can invalidate on save; the revalidate window is the
    // backstop when on-demand revalidation is not configured.
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [QUOTE_CONFIG_TAG] },
    });
    if (!res.ok) return DEFAULT_QUOTE_CONFIG;

    const json = await res.json();
    if (!json.fields) return DEFAULT_QUOTE_CONFIG;

    const decoded = decodeFields(json.fields);
    return { verticals: decoded.verticals || {} };
  } catch {
    return DEFAULT_QUOTE_CONFIG;
  }
}

/**
 * Collapse the remote config and the vertical's own compiled-in values into the
 * single shape the button component consumes.
 *
 * Falls back to the compiled-in CTA whenever the admin has not configured this
 * vertical, or has configured it incompletely — so a half-filled record in
 * Firestore can never blank out a live page's conversion element.
 */
export function resolveQuoteAction(vertical, config) {
  const fallback = {
    mode: "cta",
    label: vertical.quoteLabel,
    href: vertical.quoteUrl,
  };

  const entry = config?.verticals?.[vertical.slug];
  if (!entry || !entry.mode || entry.mode === "default") return fallback;

  if (entry.mode === "cta") {
    if (!entry.ctaLabel?.trim() || !entry.ctaUrl?.trim()) return fallback;
    return { mode: "cta", label: entry.ctaLabel.trim(), href: entry.ctaUrl.trim() };
  }

  if (entry.mode === "phone") {
    if (!entry.phoneDisplay?.trim() || !entry.phoneNumber?.trim()) return fallback;
    return {
      mode: "phone",
      label: entry.phoneDisplay.trim(),
      // tel: tolerates only digits, + and a few separators.
      href: `tel:${entry.phoneNumber.replace(/[^\d+]/g, "")}`,
    };
  }

  return fallback;
}
