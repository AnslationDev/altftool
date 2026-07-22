import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * ExclusInsider — Services module data layer.
 *
 * Pure collection CRUD at `projects/exclusinsider/services` (no separate
 * `services/settings` doc — the `/services` page hero is currently
 * hardcoded on the frontend, per CONTRACT.md). Every doc carries a numeric
 * `order` and a boolean `active` (default true).
 */

const PROJECT_ID = "exclusinsider";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];

/**
 * Suggested icon keys the frontend can look up by string. Free text is
 * allowed (the icon field is not a fixed enum in the contract), these are
 * just convenient defaults for the admin's select box.
 */
export const SERVICE_ICONS = [
  "shield-check",
  "search",
  "file-text",
  "briefcase",
  "trending-up",
  "lock",
  "globe",
  "sparkles",
];

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

function cleanPricingCta(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    eyebrow: cleanText(source.eyebrow),
    headline: cleanText(source.headline),
    body: cleanText(source.body),
    ctaLabel: cleanText(source.ctaLabel),
  };
}

function normalizeService(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    shortDescription: cleanText(payload.shortDescription),
    icon: cleanText(payload.icon) || SERVICE_ICONS[0],
    dossierNumber: cleanText(payload.dossierNumber),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    benefits: cleanPairs(payload.benefits, "title", "description"),
    features: cleanLines(payload.features),
    workflow: cleanPairs(payload.workflow, "step", "description"),
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

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
