import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Infodrif — Partners page.
 *
 * Firestore layout (the public site merges these over src/data/partners.json,
 * so every field name below must match that file exactly — a typo silently
 * drops the field back to the JSON fallback with no error):
 *
 *   projects/infodrif/partners/hero                    -> hero.settings (flat)
 *   projects/infodrif/partners/service-features        -> serviceFeatures.settings (flat, empty today)
 *   projects/infodrif/partners/service-features/cards  -> serviceFeatures.cards[]
 *   projects/infodrif/partners/features                -> features.settings (flat)
 *   projects/infodrif/partners/features/items          -> features.items[]
 *   projects/infodrif/partners/pricing                 -> pricing.settings (flat)
 *   projects/infodrif/partners/pricing/plans           -> pricing.plans[]
 */

const PROJECT_ID = "infodrif";
const SECTION_PATH = (key) => ["projects", PROJECT_ID, "partners", key];

const HERO_PATH = SECTION_PATH("hero");
const SERVICE_FEATURES_PATH = SECTION_PATH("service-features");
const SERVICE_FEATURE_CARDS_PATH = [...SERVICE_FEATURES_PATH, "cards"];
const FEATURES_PATH = SECTION_PATH("features");
const FEATURE_ITEMS_PATH = [...FEATURES_PATH, "items"];
const PRICING_PATH = SECTION_PATH("pricing");
const PRICING_PLANS_PATH = [...PRICING_PATH, "plans"];

/** Metadata for the hub index page — one card per section. */
export const PARTNERS_SECTIONS = [
  {
    key: "hero",
    label: "Hero",
    description: "Headline, paragraph, CTA label, and the hero image for the partners page.",
    route: "/infodrif/partners/hero",
  },
  {
    key: "service-features",
    label: "Service Features",
    description: "The four icon cards below the hero. Each card keeps its own gradient icon id.",
    route: "/infodrif/partners/service-features",
  },
  {
    key: "features",
    label: "Main Features",
    description: "Numbered feature rows with alternating image/text layout.",
    route: "/infodrif/partners/features",
  },
  {
    key: "pricing",
    label: "Pricing",
    description: "Pricing intro copy, the plan toggle labels, and the plan cards.",
    route: "/infodrif/partners/pricing",
  },
];

/* ── Defaults (mirror src/data/partners.json) ─────────────────────────── */

export const DEFAULT_HERO_SETTINGS = {
  heading:
    "Better teamwork and more sales, start with a InfoDrift business card management system.",
  paragraph:
    "InfoDrif helps affiliates discover high-converting offers, optimize campaigns, and maximize commissions through performance-first marketing.",
  ctaLabel: "Try Our Services",
  imageUrl: "",
  imagePath: "",
  imageAlt: "Hero",
};

export const DEFAULT_SERVICE_FEATURES_SETTINGS = {};

export const DEFAULT_FEATURES_SETTINGS = {
  heading: "Main features",
};

export const DEFAULT_PRICING_SETTINGS = {
  heading: "Pricing list",
  paragraph:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
  togglePrimaryLabel: "Premium",
  toggleSecondaryLabel: "Starter",
  defaultActivePlan: "Premium",
};

/**
 * `iconId` re-associates the inline SVG gradient definitions on the public
 * site. It is editable but the ids themselves are structural — renaming one to
 * something outside this list leaves that card without its gradient.
 */
export const SERVICE_FEATURE_ICON_IDS = ["fc1", "fc2", "fc3", "fc4"];

export const EMPTY_SERVICE_FEATURE_CARD = {
  title: "",
  description: "",
  iconId: "fc1",
  order: 0,
  active: true,
};

export const EMPTY_FEATURE_ITEM = {
  number: 1,
  title: "",
  description: "",
  imageUrl: "",
  imagePath: "",
  reverse: false,
  order: 0,
  active: true,
};

export const EMPTY_PRICING_PLAN = {
  name: "",
  price: "",
  bullets: [""],
  order: 0,
  active: true,
};

/* ── Normalizers ──────────────────────────────────────────────────────── */

const cleanText = (value = "") => String(value).trim();

const cleanList = (value) =>
  (Array.isArray(value) ? value : []).map((entry) => cleanText(entry)).filter(Boolean);

function normalizeServiceFeatureCard(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    iconId: cleanText(payload.iconId) || "fc1",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeFeatureItem(payload) {
  return {
    number: Number(payload.number) || 0,
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    reverse: payload.reverse === true,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizePricingPlan(payload) {
  return {
    name: cleanText(payload.name),
    price: cleanText(payload.price),
    bullets: cleanList(payload.bullets),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ── Services (composed from the shared factories) ────────────────────── */

const heroService = createSingletonDocService(HERO_PATH, DEFAULT_HERO_SETTINGS);
const serviceFeaturesService = createSingletonDocService(
  SERVICE_FEATURES_PATH,
  DEFAULT_SERVICE_FEATURES_SETTINGS,
);
const featuresService = createSingletonDocService(FEATURES_PATH, DEFAULT_FEATURES_SETTINGS);
const pricingService = createSingletonDocService(PRICING_PATH, DEFAULT_PRICING_SETTINGS);

const serviceFeatureCardsService = createCollectionCrudService(SERVICE_FEATURE_CARDS_PATH, {
  normalize: normalizeServiceFeatureCard,
  orderByField: "order",
});
const featureItemsService = createCollectionCrudService(FEATURE_ITEMS_PATH, {
  normalize: normalizeFeatureItem,
  orderByField: "order",
});
const pricingPlansService = createCollectionCrudService(PRICING_PLANS_PATH, {
  normalize: normalizePricingPlan,
  orderByField: "order",
});

const heroImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/partners/hero` });
const featureImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/partners/feature` });

/* Hero */
export const subscribePartnersHero = heroService.subscribe;
export const savePartnersHero = heroService.save;
export const resetPartnersHero = heroService.reset;
export const uploadPartnersHeroImage = heroImageUploader.upload;
export const deletePartnersHeroImage = heroImageUploader.remove;

/* Service features */
export const subscribeServiceFeaturesSettings = serviceFeaturesService.subscribe;
export const saveServiceFeaturesSettings = serviceFeaturesService.save;
export const subscribeServiceFeatureCards = serviceFeatureCardsService.subscribe;
export const createServiceFeatureCard = serviceFeatureCardsService.create;
export const updateServiceFeatureCard = serviceFeatureCardsService.update;
export const deleteServiceFeatureCard = serviceFeatureCardsService.remove;
export const toggleServiceFeatureCardStatus = serviceFeatureCardsService.toggleActive;

/* Features */
export const subscribeFeaturesSettings = featuresService.subscribe;
export const saveFeaturesSettings = featuresService.save;
export const resetFeaturesSettings = featuresService.reset;
export const subscribeFeatureItems = featureItemsService.subscribe;
export const createFeatureItem = featureItemsService.create;
export const updateFeatureItem = featureItemsService.update;
export const deleteFeatureItem = featureItemsService.remove;
export const toggleFeatureItemStatus = featureItemsService.toggleActive;
export const uploadFeatureItemImage = featureImageUploader.upload;
export const deleteFeatureItemImage = featureImageUploader.remove;

/* Pricing */
export const subscribePricingSettings = pricingService.subscribe;
export const savePricingSettings = pricingService.save;
export const resetPricingSettings = pricingService.reset;
export const subscribePricingPlans = pricingPlansService.subscribe;
export const createPricingPlan = pricingPlansService.create;
export const updatePricingPlan = pricingPlansService.update;
export const deletePricingPlan = pricingPlansService.remove;
export const togglePricingPlanStatus = pricingPlansService.toggleActive;
