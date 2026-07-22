import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "dealnbook";
const SERVICES_SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];

/**
 * Suggested icon keys the frontend can look up by string. Free text is
 * allowed (the icon field is not a fixed enum in the Dealnbook contract),
 * these are just convenient defaults for the admin's select box.
 */
export const SERVICE_ICONS = [
  "tag",
  "percent",
  "gift",
  "shopping-bag",
  "calendar-check",
  "badge-check",
  "map-pin",
  "sparkles",
];

export const DEFAULT_SERVICES_SETTINGS = {
  heroHeadline: "",
  heroSubcopy: "",
  heroImage: "",
};

const cleanText = (value = "") => String(value).trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanPairs(list, keyA, keyB) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      [keyA]: cleanText(item?.[keyA]),
      [keyB]: cleanText(item?.[keyB]),
    }))
    .filter((item) => item[keyA] || item[keyB]);
}

function normalizeService(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    icon: cleanText(payload.icon) || SERVICE_ICONS[0],
    shortDescription: cleanText(payload.shortDescription),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    benefits: cleanPairs(payload.benefits, "title", "description"),
    features: cleanPairs(payload.features, "title", "description"),
    workflow: cleanPairs(payload.workflow, "title", "description"),
    technologies: cleanLines(payload.technologies),
    pricingCtaHeading: cleanText(payload.pricingCtaHeading),
    pricingCtaBody: cleanText(payload.pricingCtaBody),
    pricingCtaLabel: cleanText(payload.pricingCtaLabel),
    pricingCtaHref: cleanText(payload.pricingCtaHref),
    faq: cleanPairs(payload.faq, "question", "answer"),
    relatedSlugs: cleanLines(payload.relatedSlugs),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(SERVICES_SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);
const itemsService = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });
const heroImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/services/hero` });

export const subscribeServicesSettings = settingsService.subscribe;
export const saveServicesSettings = settingsService.save;
export const uploadServicesHeroImage = heroImageUploader.upload;
export const deleteServicesHeroImage = heroImageUploader.remove;

export const subscribeServices = itemsService.subscribe;
export const createService = itemsService.create;
export const updateService = itemsService.update;
export const deleteService = itemsService.remove;
export const toggleServiceStatus = itemsService.toggleActive;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
