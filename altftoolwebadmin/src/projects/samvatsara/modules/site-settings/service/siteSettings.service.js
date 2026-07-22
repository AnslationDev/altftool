import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Samvatsara",
  logoText: "Samvatsara",
  logoSuffix: "Samvatsara",
  tagline: "A boutique creative studio for brands with something to say.",
  shortDescription:
    "We're a small studio that thinks like a big agency and designs like an atelier — brand, web, and digital craft made by hand, on purpose.",
  foundedYear: 2016,
  seo: {
    titleTemplate: "%s — Samvatsara",
    defaultTitle: "Samvatsara — Boutique Digital Marketing & Design Studio",
    description:
      "Samvatsara is a boutique digital marketing and design studio crafting warm, human brands, websites, and campaigns for businesses who refuse to be forgettable.",
    keywords: [
      "digital marketing studio",
      "boutique design agency",
      "brand studio",
      "web design",
      "UI UX design",
      "SEO",
      "email marketing",
    ],
    siteUrl: "https://www.aureliastudio.com",
  },
  social: {
    instagram: "https://instagram.com/aureliastudio",
    linkedin: "https://linkedin.com/company/aureliastudio",
    twitter: "https://twitter.com/aureliastudio",
    dribbble: "https://dribbble.com/aureliastudio",
    pinterest: "https://pinterest.com/aureliastudio",
  },
};

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

function normalizeSiteSettings(payload = {}) {
  const foundedYear = Number(payload.foundedYear);
  return {
    name: String(payload.name || "").trim(),
    logoText: String(payload.logoText || "").trim(),
    logoSuffix: String(payload.logoSuffix || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    shortDescription: String(payload.shortDescription || "").trim(),
    foundedYear: Number.isFinite(foundedYear) ? foundedYear : null,
    seo: {
      titleTemplate: String(payload.seo?.titleTemplate || "").trim(),
      defaultTitle: String(payload.seo?.defaultTitle || "").trim(),
      description: String(payload.seo?.description || "").trim(),
      keywords: normalizeKeywords(payload.seo?.keywords),
      siteUrl: String(payload.seo?.siteUrl || "").trim(),
    },
    social: {
      instagram: String(payload.social?.instagram || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      twitter: String(payload.social?.twitter || "").trim(),
      dribbble: String(payload.social?.dribbble || "").trim(),
      pinterest: String(payload.social?.pinterest || "").trim(),
    },
  };
}

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.map((word) => String(word).trim()).filter(Boolean);
  }
  return String(keywords || "")
    .split(/[\n,]/)
    .map((word) => word.trim())
    .filter(Boolean);
}
