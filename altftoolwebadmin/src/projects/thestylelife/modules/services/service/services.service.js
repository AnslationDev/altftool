import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * TheStyleLife — Services module data layer.
 *
 * Collection CRUD at `projects/thestylelife/services` plus a `services/settings`
 * singleton for the `/services` page hero AND the shared section headings on
 * every service detail page (see CONTRACT.md — field names are authoritative
 * and mirror `data/services.json` + the hardcoded section eyebrows in
 * `app/services/[slug]/page.jsx`).
 *
 * TheStyleLife differences vs the Shophobia template:
 *   - `pricingCta` is { title, description, ctaLabel } (NOT { title, subtitle, buttonLabel })
 *   - `services/settings` also carries a `heroImage` (the /services index hero
 *     illustration) and a `detailHeroCtaLabel` ("Start Your Story" on every
 *     detail page hero)
 */

const PROJECT_ID = "thestylelife";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];

/**
 * Icon keys the TheStyleLife frontend's `SERVICE_ICONS` map understands
 * (see the site's `components/ui/Icons.jsx` + `data/services.json`).
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
    description: cleanText(source.description),
    ctaLabel: cleanText(source.ctaLabel),
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
  badge: "The Services File",
  heroHeadline: "Everything Under One Masthead.",
  heroSubcopy:
    "Strategy, design, development, SEO and marketing — everything your brand needs delivered by one team, with one process and one standard of quality.",
  heroImage: "",
  heroPrimaryCtaLabel: "Book a Call",
  heroSecondaryCtaLabel: "Explore Services",
  detailHeroCtaLabel: "Start Your Story",
  benefitsEyebrow: "Why It Works",
  benefitsHeading: "The case for this discipline.",
  featuresEyebrow: "What's Included",
  featuresHeading: "Inside the engagement.",
  workflowEyebrow: "The Process",
  workflowHeading: "How we run the engagement.",
  stackEyebrow: "The Toolkit",
  stackHeading: "Built on proven infrastructure.",
  faqEyebrow: "Intake Questions",
  faqHeading: "Before you sign on.",
  relatedEyebrow: "Adjacent Work",
  relatedHeading: "Related services.",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);

export const subscribeServicesSettings = settingsDoc.subscribe;

export function saveServicesSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    heroImage: cleanText(payload.heroImage),
    heroPrimaryCtaLabel: cleanText(payload.heroPrimaryCtaLabel),
    heroSecondaryCtaLabel: cleanText(payload.heroSecondaryCtaLabel),
    detailHeroCtaLabel: cleanText(payload.detailHeroCtaLabel),
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
  });
}

// ---------------------------------------------------------------------------
// Image upload — service card/cover image + /services hero illustration
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "thestylelife/services/cover" });
const heroImageUploader = createImageUploader({ pathPrefix: "thestylelife/services/hero" });

export const uploadServiceImage = imageUploader.upload;
export const uploadServicesHeroImage = heroImageUploader.upload;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
