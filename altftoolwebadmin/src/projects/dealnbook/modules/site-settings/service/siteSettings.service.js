import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dealnbook";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Dealnbook",
  shortName: "Dealnbook",
  tagline: "Book the deal, not just the room.",
  logoText: "Dealnbook",
  logoMonogram: "D",
  description:
    "Dealnbook curates verified deals, coupons, and offers across your favorite brands so you never overpay again.",
  url: "https://www.dealnbook.com",
  founded: null,
  seo: {
    titleTemplate: "%s | Dealnbook",
    defaultTitle: "Dealnbook",
    description: "",
    keywords: [],
  },
  social: {
    instagram: "",
    linkedin: "",
    twitter: "",
    behance: "",
  },
};

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

function cleanKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeSiteSettings(payload = {}) {
  const founded = Number(payload.founded);
  return {
    name: String(payload.name || "").trim(),
    shortName: String(payload.shortName || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    logoText: String(payload.logoText || "").trim(),
    logoMonogram: String(payload.logoMonogram || "").trim(),
    description: String(payload.description || "").trim(),
    url: String(payload.url || "").trim(),
    founded: Number.isFinite(founded) ? founded : null,
    seo: {
      titleTemplate: String(payload.seo?.titleTemplate || "").trim(),
      defaultTitle: String(payload.seo?.defaultTitle || "").trim(),
      description: String(payload.seo?.description || "").trim(),
      keywords: cleanKeywords(payload.seo?.keywords),
    },
    social: {
      instagram: String(payload.social?.instagram || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      twitter: String(payload.social?.twitter || "").trim(),
      behance: String(payload.social?.behance || "").trim(),
    },
  };
}
