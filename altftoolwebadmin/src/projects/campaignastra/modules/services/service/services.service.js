import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "campaignastra";
const SERVICES_SETTINGS_PATH = ["projects", PROJECT_ID, "services", "settings"];
const SERVICE_ITEMS_PATH = ["projects", PROJECT_ID, "serviceItems"];

export const DEFAULT_SERVICES_SETTINGS = {
  eyebrow: "What we do",
  title: "Our Services",
  subtitle: "Full-funnel marketing and product systems for growth-stage brands.",
  seoTitle: "Our Services | Campaignastra",
  seoDescription: "Explore Campaignastra's full-funnel marketing and product services for growth-stage brands.",
};

/**
 * Fixed icon set the public frontend's ServiceCard.js looks up by string key.
 * Keep in sync with the iconMap in campaignastra/src/components/ServiceCard.js.
 */
export const SERVICE_ICON_OPTIONS = [
  "MonitorSmartphone",
  "Smartphone",
  "Search",
  "Mail",
  "Share2",
  "Code2",
  "LayoutTemplate",
  "PenTool",
];

const cleanText = (value = "") => String(value).trim();

const toFixedArray = (value, length) =>
  Array.from({ length }, (_, index) => cleanText(value?.[index]));

function normalizeServiceItem(payload) {
  return {
    slug: cleanText(payload.slug),
    title: cleanText(payload.title),
    icon: SERVICE_ICON_OPTIONS.includes(payload.icon) ? payload.icon : SERVICE_ICON_OPTIONS[0],
    shortDescription: cleanText(payload.shortDescription),
    description: cleanText(payload.description),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    benefits: toFixedArray(payload.benefits, 3),
    process: toFixedArray(payload.process, 3),
    features: toFixedArray(payload.features, 4),
    seoTitle: cleanText(payload.seoTitle),
    seoDescription: cleanText(payload.seoDescription),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(SERVICES_SETTINGS_PATH, DEFAULT_SERVICES_SETTINGS);
const itemsService = createCollectionCrudService(SERVICE_ITEMS_PATH, { normalize: normalizeServiceItem });
const serviceImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/services/item` });

export const subscribeServicesSettings = settingsService.subscribe;
export const saveServicesSettings = settingsService.save;

export const subscribeServiceItems = itemsService.subscribe;
export const createServiceItem = itemsService.create;
export const updateServiceItem = itemsService.update;
export const deleteServiceItem = itemsService.remove;
export const toggleServiceItemStatus = itemsService.toggleActive;

export const uploadServiceImage = serviceImageUploader.upload;
export const deleteServiceImage = serviceImageUploader.remove;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
