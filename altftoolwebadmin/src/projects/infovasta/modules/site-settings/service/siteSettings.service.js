import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  brand: {
    logoType: "text",
    logoText: "InfoVsta",
    logoImage: "",
  },
  seo: {
    baseUrl: "https://infovsta.example.com",
    siteName: "InfoVsta - Digital Marketing Agency",
    titleTemplate: "%s | InfoVsta",
    description:
      "InfoVsta is a digital marketing agency helping brands grow through web design, development, SEO, social media and email marketing.",
    favicon: "/favicon.svg",
    ogImage: "/assets/images/hero-banner.png",
    twitterCard: "summary_large_image",
    organizationName: "InfoVsta",
    sameAs: [],
  },
};

const service = createSingletonDocService(SITE_PATH, DEFAULT_SITE_SETTINGS);

export const subscribeSiteSettings = service.subscribe;

export function saveSiteSettings(payload) {
  return service.save(normalizeSiteSettings(payload));
}

function normalizeSiteSettings(payload = {}) {
  return {
    brand: {
      logoType: payload.brand?.logoType === "image" ? "image" : "text",
      logoText: String(payload.brand?.logoText || "").trim(),
      logoImage: String(payload.brand?.logoImage || "").trim(),
    },
    seo: {
      baseUrl: String(payload.seo?.baseUrl || "").trim(),
      siteName: String(payload.seo?.siteName || "").trim(),
      titleTemplate: String(payload.seo?.titleTemplate || "").trim(),
      description: String(payload.seo?.description || "").trim(),
      favicon: String(payload.seo?.favicon || "").trim(),
      ogImage: String(payload.seo?.ogImage || "").trim(),
      twitterCard: String(payload.seo?.twitterCard || "").trim(),
      organizationName: String(payload.seo?.organizationName || "").trim(),
      sameAs: normalizeList(payload.seo?.sameAs),
    },
  };
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
