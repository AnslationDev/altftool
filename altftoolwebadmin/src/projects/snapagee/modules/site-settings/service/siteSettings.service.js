import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Site Settings module data layer.
 *
 * Doc `projects/snapagee/settings/site` (global brand/contact/social/CTA
 * defaults). See CONTRACT.md.
 *
 * Differences vs the TheStyleLife template:
 *   - `founded` is a STRING (e.g. "2019"), not a number
 *   - social links are 4 fixed plain string fields (twitter/linkedin/
 *     instagram/dribbble) directly on this doc — no `siteSocial` collection
 *   - no `keywords` field — not part of this tenant's contract
 *   - CTA labels (`ctaPrimaryLabel`, `ctaSecondaryLabel`) live here — there
 *     is no separate navbar-level CTA doc for this tenant
 */

const PROJECT_ID = "snapagee";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Snapagee",
  tagline: "Results snap into focus.",
  description:
    "Snapagee is a digital marketing and product studio that ships fast, precise, revenue-driving work for ambitious brands.",
  url: "https://www.snapagee.com",
  email: "hello@snapagee.com",
  phone: "+1 (415) 555-0142",
  address: "548 Market Street, Suite 61000, San Francisco, CA 94104",
  founded: "2019",
  twitter: "https://twitter.com/snapagee",
  linkedin: "https://linkedin.com/company/snapagee",
  instagram: "https://instagram.com/snapagee",
  dribbble: "https://dribbble.com/snapagee",
  ctaPrimaryLabel: "Book a Call",
  ctaSecondaryLabel: "See Our Work",
};

const cleanText = (value = "") => String(value ?? "").trim();

function normalizeSiteSettings(payload = {}) {
  return {
    name: cleanText(payload.name),
    tagline: cleanText(payload.tagline),
    description: cleanText(payload.description),
    url: cleanText(payload.url),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    address: cleanText(payload.address),
    founded: cleanText(payload.founded),
    twitter: cleanText(payload.twitter),
    linkedin: cleanText(payload.linkedin),
    instagram: cleanText(payload.instagram),
    dribbble: cleanText(payload.dribbble),
    ctaPrimaryLabel: cleanText(payload.ctaPrimaryLabel),
    ctaSecondaryLabel: cleanText(payload.ctaSecondaryLabel),
  };
}

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}
