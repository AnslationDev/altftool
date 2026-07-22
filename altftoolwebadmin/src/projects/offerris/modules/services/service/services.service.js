import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Offerris — Services module data layer.
 *
 * Collection CRUD at `projects/offerris/services` plus a `services/settings`
 * singleton for the `/services` page hero (see CONTRACT.md — field names are
 * authoritative and mirror `data/services.json` + `data/pages.json.services`).
 *
 * Offerris differences vs the exclusinsider template:
 *   - each service has an `image` (uploaded card/cover image)
 *   - workflow rows use `title` (not `step`)
 *   - pricingCta is { headline, subcopy, ctaLabel, ctaHref }
 *   - no dossierNumber
 */

const PROJECT_ID = "offerris";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];

/**
 * Icon keys the Offerris frontend's `ServiceIcon` component understands
 * (see the site's `components/ui/Icons.jsx` + `data/nav.json`).
 */
export const SERVICE_ICONS = [
  "web",
  "mobile",
  "seo",
  "email",
  "social",
  "webapp",
  "wordpress",
  "uiux",
];

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

function cleanPairs(list, keyA, keyB) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      [keyA]: cleanText(item?.[keyA]),
      [keyB]: cleanText(item?.[keyB]),
    }))
    .filter((item) => item[keyA] || item[keyB]);
}

function cleanPricingCta(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    headline: cleanText(source.headline),
    subcopy: cleanText(source.subcopy),
    ctaLabel: cleanText(source.ctaLabel),
    ctaHref: cleanText(source.ctaHref),
  };
}

function normalizeService(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    image: cleanText(payload.image),
    shortDescription: cleanText(payload.shortDescription),
    icon: cleanText(payload.icon) || SERVICE_ICONS[0],
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    benefits: cleanPairs(payload.benefits, "title", "description"),
    features: cleanLines(payload.features),
    workflow: cleanPairs(payload.workflow, "title", "description"),
    technologies: cleanLines(payload.technologies),
    pricingCta: cleanPricingCta(payload.pricingCta),
    faq: cleanPairs(payload.faq, "question", "answer"),
    relatedSlugs: cleanLines(payload.relatedSlugs),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const itemsService = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });

export const subscribeServices = itemsService.subscribe;
export const createService = itemsService.create;
export const updateService = itemsService.update;
export const deleteService = itemsService.remove;
export const toggleServiceStatus = itemsService.toggleActive;

// ---------------------------------------------------------------------------
// /services page hero — doc services/settings
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_SETTINGS = {
  badgeSuffix: "Core Services",
  heroHeadline: "Full-stack digital, delivered in one current.",
  heroSubcopy:
    "Every discipline your brand needs to launch, grow, and scale — run by one senior team instead of six disconnected vendors.",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);

export const subscribeServicesSettings = settingsDoc.subscribe;

export function saveServicesSettings(payload) {
  return settingsDoc.save({
    badgeSuffix: cleanText(payload.badgeSuffix),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
  });
}

// ---------------------------------------------------------------------------
// Image upload — service card/cover image
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "offerris/services/cover" });

export const uploadServiceImage = imageUploader.upload;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
