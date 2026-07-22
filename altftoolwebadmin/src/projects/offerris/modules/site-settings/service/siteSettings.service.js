import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerris";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Offerris",
  logoText: "Offerris",
  tagline: "Kinetic digital experiences for brands that refuse to idle.",
  description:
    "Offerris is a kinetic, neon-futurist digital agency building websites, apps, and campaigns for brands that move at the speed of culture.",
  url: "https://offerris.agency",
  email: "hello@offeris.agency",
  phone: "+1 (415) 555-0142",
  foundedYear: 2018,
  social: {
    twitter: "https://twitter.com/offerris",
    instagram: "https://instagram.com/offerris",
    linkedin: "https://linkedin.com/company/offerris",
    dribbble: "https://dribbble.com/offerris",
    youtube: "https://youtube.com/@offerris",
  },
  seo: {
    titleTemplate: "%s | Offerris",
    defaultTitle: "Offerris — Kinetic Digital Agency",
    defaultDescription:
      "Offerris builds websites, apps, and growth engines for brands that move fast. Strategy, design, and engineering fused into one electric current.",
    keywords: ["digital agency", "web design", "app development", "SEO", "branding", "Offerris"],
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
  return {
    name: String(payload.name || "").trim(),
    logoText: String(payload.logoText || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    description: String(payload.description || "").trim(),
    url: String(payload.url || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    foundedYear: Number(payload.foundedYear) || 0,
    social: {
      twitter: String(payload.social?.twitter || "").trim(),
      instagram: String(payload.social?.instagram || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      dribbble: String(payload.social?.dribbble || "").trim(),
      youtube: String(payload.social?.youtube || "").trim(),
    },
    seo: {
      titleTemplate: String(payload.seo?.titleTemplate || "").trim(),
      defaultTitle: String(payload.seo?.defaultTitle || "").trim(),
      defaultDescription: String(payload.seo?.defaultDescription || "").trim(),
      keywords: cleanKeywords(payload.seo?.keywords),
    },
  };
}
