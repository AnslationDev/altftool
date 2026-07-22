import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "Offerhoppr",
  tagline: "Skip the search. Hop straight to the best offers.",
  description:
    "Offerhoppr curates the best deals, coupons, and offers across your favorite brands so you never overpay again.",
  url: "https://www.offerhoppr.com",
  email: "hello@offerhoppr.com",
  phone: "",
  address: "",
  social: {
    instagram: "",
    twitter: "",
    linkedin: "",
    tiktok: "",
    youtube: "",
  },
  founded: null,
  ctaPrimary: "Get Started",
  ctaSecondary: "Learn More",
};

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

function normalizeSiteSettings(payload = {}) {
  const founded = Number(payload.founded);
  return {
    name: String(payload.name || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    description: String(payload.description || "").trim(),
    url: String(payload.url || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    address: String(payload.address || "").trim(),
    social: {
      instagram: String(payload.social?.instagram || "").trim(),
      twitter: String(payload.social?.twitter || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      tiktok: String(payload.social?.tiktok || "").trim(),
      youtube: String(payload.social?.youtube || "").trim(),
    },
    founded: Number.isFinite(founded) ? founded : null,
    ctaPrimary: String(payload.ctaPrimary || "").trim(),
    ctaSecondary: String(payload.ctaSecondary || "").trim(),
  };
}
