import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Site Settings module data layer.
 *
 * Doc `projects/shophobia/settings/site` (global brand/contact/social/SEO)
 * plus the `siteStats` collection (the four animated counters on home —
 * `site.json.stats` is the frontend fallback). See CONTRACT.md.
 *
 * Shophobia differences vs the offerris template:
 *   - `social` is an ARRAY of { name, handle, url } (site.json shape)
 *   - has `legalName`, `address`, string `founded` (no logoText)
 *   - seo carries only `keywords` (title/description derive from name/tagline)
 */

const PROJECT_ID = "shophobia";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];
const STATS_PATH = ["projects", PROJECT_ID, "siteStats"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Shophobia",
  legalName: "Shophobia Digital Collective",
  tagline: "We build brands for the internet's next main character.",
  description:
    "Shophobia is a Y2K-retro-futurist digital agency building websites, apps, and campaigns for brands that refuse to blend in.",
  url: "https://shophobia.example",
  email: "hello@shophobia.studio",
  phone: "+1 (212) 555-0199",
  address: "212 Chrome Alley, Suite 3000, New York, NY 10012",
  founded: "2021",
  social: [
    { name: "Instagram", handle: "@shophobia.studio", url: "#" },
    { name: "TikTok", handle: "@shophobia", url: "#" },
    { name: "X", handle: "@shophobiahq", url: "#" },
    { name: "LinkedIn", handle: "Shophobia", url: "#" },
    { name: "Dribbble", handle: "shophobia", url: "#" },
  ],
  seo: {
    keywords: [
      "digital agency",
      "web design",
      "branding",
      "Y2K design",
      "app development",
      "SEO agency",
    ],
  },
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

function cleanSocial(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => ({
      name: cleanText(item?.name),
      handle: cleanText(item?.handle),
      url: cleanText(item?.url) || "#",
    }))
    .filter((item) => item.name);
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
    founded: cleanText(payload.founded),
    social: cleanSocial(payload.social),
    seo: {
      keywords: cleanLines(payload.seo?.keywords),
    },
  };
}

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

/* ------------------------- stats (home counters) -------------------------- */

function normalizeStat(payload) {
  return {
    label: cleanText(payload.label),
    value: Number(payload.value) || 0,
    suffix: cleanText(payload.suffix),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const statsService = createCollectionCrudService(STATS_PATH, {
  normalize: normalizeStat,
  orderByField: "order",
});

export const subscribeStats = statsService.subscribe;
export const createStat = statsService.create;
export const updateStat = statsService.update;
export const deleteStat = statsService.remove;
export const toggleStatStatus = statsService.toggleActive;
