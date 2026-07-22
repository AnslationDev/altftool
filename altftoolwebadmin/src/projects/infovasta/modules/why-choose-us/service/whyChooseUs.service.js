import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Infovasta — Why Choose Us module data layer.
 *
 * Collection `projects/infovasta/whyChooseUs`. Every doc carries a numeric
 * `order` and a boolean `active` (default true). `icon` is a free-text
 * Ionicons name (e.g. "flash-outline") and `color` is a free-text HSL triplet
 * string (e.g. "174, 77%, 50%").
 */

const PROJECT_ID = "infovasta";
const WHY_CHOOSE_US_PATH = ["projects", PROJECT_ID, "whyChooseUs"];

function normalizeWhyChooseUs(payload) {
  return {
    title: String(payload.title || "").trim(),
    icon: String(payload.icon || "").trim(),
    color: String(payload.color || "").trim(),
    text: String(payload.text || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const whyChooseUsService = createCollectionCrudService(WHY_CHOOSE_US_PATH, {
  normalize: normalizeWhyChooseUs,
  orderByField: "order",
});

export const subscribeWhyChooseUs = whyChooseUsService.subscribe;
export const createWhyChooseUs = whyChooseUsService.create;
export const updateWhyChooseUs = whyChooseUsService.update;
export const deleteWhyChooseUs = whyChooseUsService.remove;
export const toggleWhyChooseUsStatus = whyChooseUsService.toggleActive;
