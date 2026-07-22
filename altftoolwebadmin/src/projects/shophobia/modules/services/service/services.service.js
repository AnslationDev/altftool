import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Shophobia — Services module data layer.
 *
 * Collection CRUD at `projects/shophobia/services` plus a `services/settings`
 * singleton for the `/services` page hero AND the shared section headings on
 * every service detail page (see CONTRACT.md — field names are authoritative
 * and mirror `data/services.json` + `data/pages.json.services`).
 *
 * Shophobia differences vs the offerris template:
 *   - `features` are [{title, description}] objects (not strings)
 *   - workflow rows keep a display `step` ("01"…) besides title/description
 *   - pricingCta is { title, subtitle, buttonLabel } (href is always /contact)
 */

const PROJECT_ID = "shophobia";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];

/**
 * Icon keys the Shophobia frontend's `SERVICE_ICONS` map understands
 * (see the site's `components/ui/Icons.jsx` + `data/services.json`).
 */
export const SERVICE_ICONS = [
  "globe",
  "device",
  "signal",
  "mail",
  "spark",
  "cube",
  "layers",
  "prism",
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

function cleanWorkflow(list) {
  return (Array.isArray(list) ? list : [])
    .map((item, index) => ({
      step: cleanText(item?.step) || String(index + 1).padStart(2, "0"),
      title: cleanText(item?.title),
      description: cleanText(item?.description),
    }))
    .filter((item) => item.title || item.description);
}

function cleanPricingCta(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    title: cleanText(source.title),
    subtitle: cleanText(source.subtitle),
    buttonLabel: cleanText(source.buttonLabel),
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
    features: cleanPairs(payload.features, "title", "description"),
    workflow: cleanWorkflow(payload.workflow),
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
// /services page hero + shared detail-page headings — doc services/settings
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_SETTINGS = {
  badge: "Full-Stack Services",
  heroHeadline: "Eight Disciplines. One Chrome-Coated Studio.",
  heroSubcopy:
    "Strategy, design, and engineering under one roof — pick a single channel or let us run the whole build.",
  benefitsEyebrow: "Benefits",
  benefitsHeading: "Why This Service Earns Its Spend",
  featuresEyebrow: "What's Included",
  featuresHeading: "Core Features Of The Engagement",
  workflowEyebrow: "Process",
  workflowHeading: "How We Get It Done",
  stackEyebrow: "Stack",
  stackHeading: "Tools & Technologies We Reach For",
  faqEyebrow: "FAQ",
  faqHeading: "Questions About This Service",
  relatedEyebrow: "Keep Exploring",
  relatedHeading: "Related Services",
  heroPrimaryCtaLabel: "Start This Project",
  heroSecondaryCtaLabel: "All Services",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);

export const subscribeServicesSettings = settingsDoc.subscribe;

export function saveServicesSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    benefitsEyebrow: cleanText(payload.benefitsEyebrow),
    benefitsHeading: cleanText(payload.benefitsHeading),
    featuresEyebrow: cleanText(payload.featuresEyebrow),
    featuresHeading: cleanText(payload.featuresHeading),
    workflowEyebrow: cleanText(payload.workflowEyebrow),
    workflowHeading: cleanText(payload.workflowHeading),
    stackEyebrow: cleanText(payload.stackEyebrow),
    stackHeading: cleanText(payload.stackHeading),
    faqEyebrow: cleanText(payload.faqEyebrow),
    faqHeading: cleanText(payload.faqHeading),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
    heroPrimaryCtaLabel: cleanText(payload.heroPrimaryCtaLabel),
    heroSecondaryCtaLabel: cleanText(payload.heroSecondaryCtaLabel),
  });
}

// ---------------------------------------------------------------------------
// Image upload — service card/cover image
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "shophobia/services/cover" });

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
