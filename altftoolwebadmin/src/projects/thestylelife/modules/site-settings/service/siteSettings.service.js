import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * TheStyleLife — Site Settings module data layer.
 *
 * Doc `projects/thestylelife/settings/site` (global brand/contact/SEO)
 * plus the `siteSocial` collection (matches `site.json.social`'s
 * `[{label, href}]` shape). See CONTRACT.md.
 *
 * Differences vs the Shophobia template:
 *   - `foundedYear` is a NUMBER (e.g. 2016), not a string `founded`
 *   - no `seo.keywords` nesting — `keywords` is a flat top-level string[]
 *   - social links are their own ordered `siteSocial` collection instead of
 *     an inline `social` array field on the settings doc
 *   - no stats collection here — TheStyleLife's home-page stats live in the
 *     `home` module's `homeStats` collection instead
 */

const PROJECT_ID = "thestylelife";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];
const SOCIAL_PATH = ["projects", PROJECT_ID, "siteSocial"];

export const DEFAULT_SITE_SETTINGS = {
  name: "TheStyleLife",
  legalName: "TheStyleLife Studio",
  tagline: "We design brands the way stylists design a look.",
  description:
    "TheStyleLife is an editorial-minded digital agency for brands who refuse to blend in. We build websites, apps, and campaigns with the eye of a stylist and the discipline of an engineer.",
  url: "https://www.thestylife.studio",
  email: "hello@thestylife.studio",
  phone: "+1 (212) 555-0192",
  address: "212 Mercer Street, Suite 5A, New York, NY 10012",
  foundedYear: 2016,
  keywords: [
    "SILHOUETTE",
    "SYSTEM",
    "STORY",
    "SIGNAL",
    "STRUCTURE",
    "STYLE",
    "SUBSTANCE",
    "SEASON",
  ],
};

const cleanText = (value = "") => String(value ?? "").trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeSiteSettings(payload = {}) {
  return {
    name: cleanText(payload.name),
    legalName: cleanText(payload.legalName),
    tagline: cleanText(payload.tagline),
    description: cleanText(payload.description),
    url: cleanText(payload.url),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    address: cleanText(payload.address),
    foundedYear: Number(payload.foundedYear) || 0,
    keywords: cleanLines(payload.keywords),
  };
}

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

/* ---------------------------- social (siteSocial) -------------------------- */

function normalizeSocial(payload = {}) {
  return {
    label: cleanText(payload.label),
    href: cleanText(payload.href) || "#",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const socialService = createCollectionCrudService(SOCIAL_PATH, {
  normalize: normalizeSocial,
  orderByField: "order",
});

export const subscribeSocial = socialService.subscribe;
export const createSocial = socialService.create;
export const updateSocial = socialService.update;
export const deleteSocial = socialService.remove;
export const toggleSocialStatus = socialService.toggleActive;
