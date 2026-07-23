import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Snapagee — Services module data layer.
 *
 * Collection CRUD at `projects/snapagee/services` plus a `services/settings`
 * singleton for the `/services` index page header + FAQ block AND the shared
 * section headings repeated on every service detail page (see CONTRACT.md —
 * field names are authoritative and mirror `data/services.json` + the
 * hardcoded section eyebrows in the frontend's `app/services/[slug]/page.jsx`).
 *
 * Snapagee differences vs the TheStyleLife template:
 *   - `pricingCta` is { title, description, buttonLabel } (NOT { title, description, ctaLabel })
 *   - `services/settings` has NO hero image / hero CTA fields — just the
 *     index page's eyebrow/heading/description + its own list-FAQ block,
 *     plus five shared detail-page section headings (benefits/features/
 *     workflow/stack label/faq/related). No `badge`/`heroHeadline` fields
 *     exist on this tenant's settings doc.
 *   - The `services` collection starts EMPTY — the frontend's bundled
 *     `data/services.json` already carries all 8 real services; admin only
 *     adds/overrides on top via the per-field merge in `lib/mergeContent.js`.
 */

const PROJECT_ID = "snapagee";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];

/**
 * Icon keys the Snapagee frontend's `ServiceIcon` map understands (see
 * CONTRACT.md) — any other value silently falls back to `web-design`.
 */
export const SERVICE_ICONS = [
  "web-design",
  "mobile-app",
  "seo",
  "email-marketing",
  "social-media",
  "custom-web-app",
  "wordpress",
  "ui-ux",
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
// /services index header + FAQ + shared detail-page headings — doc services/settings
// ---------------------------------------------------------------------------
export const DEFAULT_SERVICES_SETTINGS = {
  pageEyebrow: "What We Do",
  pageHeading: "Eight disciplines. One senior team.",
  pageDescription:
    "From first pixel to production deploy, every discipline you need to launch and grow lives under one roof — no handoffs, no dilution.",
  listFaqEyebrow: "Questions",
  listFaqHeading: "Frequently asked",
  listFaqDescription:
    "Answers to what prospective clients ask us most before kicking off a project.",
  benefitsEyebrow: "Benefits",
  benefitsHeading: "Why this works",
  featuresEyebrow: "Included",
  featuresHeading: "What's in the build",
  workflowEyebrow: "Process",
  workflowHeading: "How we get there",
  stackLabel: "Tools & Technologies",
  faqEyebrow: "FAQ",
  faqHeading: "Common questions",
  relatedEyebrow: "Related",
  relatedHeading: "Pairs well with",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);

export const subscribeServicesSettings = settingsDoc.subscribe;

export function saveServicesSettings(payload) {
  return settingsDoc.save({
    pageEyebrow: cleanText(payload.pageEyebrow),
    pageHeading: cleanText(payload.pageHeading),
    pageDescription: cleanText(payload.pageDescription),
    listFaqEyebrow: cleanText(payload.listFaqEyebrow),
    listFaqHeading: cleanText(payload.listFaqHeading),
    listFaqDescription: cleanText(payload.listFaqDescription),
    benefitsEyebrow: cleanText(payload.benefitsEyebrow),
    benefitsHeading: cleanText(payload.benefitsHeading),
    featuresEyebrow: cleanText(payload.featuresEyebrow),
    featuresHeading: cleanText(payload.featuresHeading),
    workflowEyebrow: cleanText(payload.workflowEyebrow),
    workflowHeading: cleanText(payload.workflowHeading),
    stackLabel: cleanText(payload.stackLabel),
    faqEyebrow: cleanText(payload.faqEyebrow),
    faqHeading: cleanText(payload.faqHeading),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
  });
}

// ---------------------------------------------------------------------------
// Image upload — service card/cover image
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "snapagee/services/cover" });

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
