import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const SERVICES_SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];

/**
 * Fixed icon set the public frontend looks up by string key.
 * Keep in sync with offerhopper's `components/ui/Icons.jsx` SERVICE_ICONS map.
 */
export const SERVICE_ICONS = [
  "globe",
  "phone",
  "search",
  "mail",
  "megaphone",
  "layers",
  "wordpress",
  "palette",
];

export const DEFAULT_SERVICES_SETTINGS = {
  heroHeadline: "",
  heroSubcopy: "",
  ctaHeadline: "",
  ctaSubcopy: "",
  ctaButtonLabel: "",
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

function cleanBenefits(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      title: cleanText(item?.title),
      description: cleanText(item?.description),
    }))
    .filter((item) => item.title || item.description);
}

function cleanFeatures(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      title: cleanText(item?.title),
      description: cleanText(item?.description),
    }))
    .filter((item) => item.title || item.description);
}

function cleanWorkflow(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      step: cleanText(item?.step),
      description: cleanText(item?.description),
    }))
    .filter((item) => item.step || item.description);
}

function cleanFaq(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      question: cleanText(item?.question),
      answer: cleanText(item?.answer),
    }))
    .filter((item) => item.question || item.answer);
}

function normalizeService(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    icon: SERVICE_ICONS.includes(payload.icon) ? payload.icon : SERVICE_ICONS[0],
    shortDescription: cleanText(payload.shortDescription),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    benefits: cleanBenefits(payload.benefits),
    features: cleanFeatures(payload.features),
    workflow: cleanWorkflow(payload.workflow),
    technologies: cleanLines(payload.technologies),
    pricingCta: {
      headline: cleanText(payload.pricingCta?.headline),
      subcopy: cleanText(payload.pricingCta?.subcopy),
      buttonLabel: cleanText(payload.pricingCta?.buttonLabel),
    },
    faq: cleanFaq(payload.faq),
    relatedSlugs: cleanLines(payload.relatedSlugs),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(SERVICES_SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);
const itemsService = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });

export const subscribeServicesSettings = settingsService.subscribe;
export const saveServicesSettings = settingsService.save;

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
