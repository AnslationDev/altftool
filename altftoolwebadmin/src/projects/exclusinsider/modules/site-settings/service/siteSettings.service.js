import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "exclusinsider";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "ExclusInsider",
  legalName: "ExclusInsider Growth House LLC",
  tagline: "The Agency Your Competitors Hope You Never Find",
  description:
    "ExclusInsider is a members-only growth agency operating on referral and reputation. We build, market, and defend the digital presence of brands that refuse to be ordinary.",
  founded: "",
  clearanceIssued: "",
  url: "https://www.exclusinsider.agency",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  hours: "",
  social: {
    instagram: "",
    linkedin: "",
    x: "",
    youtube: "",
  },
  keywords: [],
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
    legalName: String(payload.legalName || "").trim(),
    tagline: String(payload.tagline || "").trim(),
    description: String(payload.description || "").trim(),
    founded: String(payload.founded || "").trim(),
    clearanceIssued: String(payload.clearanceIssued || "").trim(),
    url: String(payload.url || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    addressLine1: String(payload.addressLine1 || "").trim(),
    addressLine2: String(payload.addressLine2 || "").trim(),
    hours: String(payload.hours || "").trim(),
    social: {
      instagram: String(payload.social?.instagram || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      x: String(payload.social?.x || "").trim(),
      youtube: String(payload.social?.youtube || "").trim(),
    },
    keywords: cleanKeywords(payload.keywords),
  };
}
