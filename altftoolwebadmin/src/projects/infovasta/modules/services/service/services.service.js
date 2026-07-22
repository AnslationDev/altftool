import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const SERVICES_PATH = ["projects", PROJECT_ID, "services"];
const SERVICE_PAGE_PATH = ["projects", PROJECT_ID, "pages", "service"];

export const DEFAULT_SERVICE_PAGE_CONTENT = {
  meta: {
    title: "Our Services | Infovasta",
    description: "Explore the technology and design services Infovasta offers to help brands ship faster.",
  },
  hero: {
    eyebrow: "What we do",
    title: "Services built to",
    highlight: "scale your business.",
    description:
      "From web platforms to bespoke software, our team designs and ships products that move your business forward.",
  },
  detail: {
    breadcrumb: "Services",
    quoteLabel: "Get a Quote",
    techHeading: "Technology Stack",
    whyHeading: "Why choose this service",
    whyText: "We combine strategy, design, and engineering to deliver measurable outcomes for every engagement.",
    processHeading: "Our Process",
    pricingHeadingPrefix: "Pricing for",
    pricingText: "Every project is scoped around your goals and budget — reach out for a tailored estimate.",
    pricingLabel: "Get a Project Estimate",
    faqHeading: "Frequently Asked Questions",
    contactHeading: "Let's build something great",
    relatedHeading: "Related Services",
  },
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

function cleanFaq(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      q: cleanText(item?.q),
      a: cleanText(item?.a),
    }))
    .filter((item) => item.q || item.a);
}

function normalizeService(payload) {
  return {
    slug: createSlug(payload.slug),
    title: cleanText(payload.title),
    shortDescription: cleanText(payload.shortDescription),
    description: cleanText(payload.description),
    icon: cleanText(payload.icon),
    color: cleanText(payload.color),
    features: cleanLines(payload.features),
    techStack: cleanLines(payload.techStack),
    faq: cleanFaq(payload.faq),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeServicePageContent(payload) {
  return {
    meta: {
      title: cleanText(payload?.meta?.title),
      description: cleanText(payload?.meta?.description),
    },
    hero: {
      eyebrow: cleanText(payload?.hero?.eyebrow),
      title: cleanText(payload?.hero?.title),
      highlight: cleanText(payload?.hero?.highlight),
      description: cleanText(payload?.hero?.description),
    },
    detail: {
      breadcrumb: cleanText(payload?.detail?.breadcrumb),
      quoteLabel: cleanText(payload?.detail?.quoteLabel),
      techHeading: cleanText(payload?.detail?.techHeading),
      whyHeading: cleanText(payload?.detail?.whyHeading),
      whyText: cleanText(payload?.detail?.whyText),
      processHeading: cleanText(payload?.detail?.processHeading),
      pricingHeadingPrefix: cleanText(payload?.detail?.pricingHeadingPrefix),
      pricingText: cleanText(payload?.detail?.pricingText),
      pricingLabel: cleanText(payload?.detail?.pricingLabel),
      faqHeading: cleanText(payload?.detail?.faqHeading),
      contactHeading: cleanText(payload?.detail?.contactHeading),
      relatedHeading: cleanText(payload?.detail?.relatedHeading),
    },
  };
}

const itemsService = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });
const pageContentService = createSingletonDocService(SERVICE_PAGE_PATH, DEFAULT_SERVICE_PAGE_CONTENT);

export const subscribeServices = itemsService.subscribe;
export const createService = itemsService.create;
export const updateService = itemsService.update;
export const deleteService = itemsService.remove;
export const toggleServiceStatus = itemsService.toggleActive;

export const subscribeServicePageContent = pageContentService.subscribe;
export async function saveServicePageContent(payload) {
  await pageContentService.save(normalizeServicePageContent(payload));
}

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
