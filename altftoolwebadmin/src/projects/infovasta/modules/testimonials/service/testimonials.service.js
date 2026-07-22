import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Infovasta — Testimonials module data layer.
 *
 * Collection `projects/infovasta/testimonials`. Every doc carries a numeric
 * `order` and a boolean `active` (default true).
 */

const PROJECT_ID = "infovasta";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

function normalizeTestimonial(payload) {
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));
  return {
    name: String(payload.name || "").trim(),
    company: String(payload.company || "").trim(),
    initials: String(payload.initials || "").trim(),
    color: String(payload.color || "").trim(),
    rating,
    review: String(payload.review || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const testimonialsService = createCollectionCrudService(TESTIMONIALS_PATH, {
  normalize: normalizeTestimonial,
  orderByField: "order",
});

export const subscribeTestimonials = testimonialsService.subscribe;
export const createTestimonial = testimonialsService.create;
export const updateTestimonial = testimonialsService.update;
export const deleteTestimonial = testimonialsService.remove;
export const toggleTestimonialStatus = testimonialsService.toggleActive;
