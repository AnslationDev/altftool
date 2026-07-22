import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dailyhnt";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];

export const SERVICE_ICONS = ["code", "device", "search", "mail", "share", "terminal", "layers", "grid"];

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanBenefits(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title || item.description);
}

function cleanWorkflow(list) {
  return (Array.isArray(list) ? list : [])
    .map((item, index) => ({
      step: Number(item?.step) || index + 1,
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title || item.description);
}

function cleanFaq(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer);
}

function normalizeService(payload) {
  return {
    slug: String(payload.slug || "").trim().toLowerCase(),
    number: String(payload.number || "").trim(),
    icon: SERVICE_ICONS.includes(payload.icon) ? payload.icon : "code",
    title: String(payload.title || "").trim(),
    shortDescription: String(payload.shortDescription || "").trim(),
    heroHeadline: String(payload.heroHeadline || "").trim(),
    heroSubcopy: String(payload.heroSubcopy || "").trim(),
    benefits: cleanBenefits(payload.benefits),
    features: cleanLines(payload.features),
    workflow: cleanWorkflow(payload.workflow),
    technologies: cleanLines(payload.technologies),
    pricingCta: {
      headline: String(payload.pricingCta?.headline || "").trim(),
      body: String(payload.pricingCta?.body || "").trim(),
    },
    faq: cleanFaq(payload.faq),
    relatedSlugs: cleanLines(payload.relatedSlugs),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const service = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });

export const subscribeServices = service.subscribe;
export const createService = service.create;
export const updateService = service.update;
export const deleteService = service.remove;
export const toggleServiceStatus = service.toggleActive;
