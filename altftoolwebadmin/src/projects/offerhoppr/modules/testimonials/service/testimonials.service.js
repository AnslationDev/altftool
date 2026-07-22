import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Offerhoppr — Testimonials module data layer.
 *
 * Pure collection CRUD at `projects/offerhoppr/testimonials`. Every doc
 * carries a numeric `order` and a boolean `active` (default true).
 */

const PROJECT_ID = "offerhoppr";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

function normalizeTestimonial(payload) {
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));
  return {
    quote: String(payload.quote || "").trim(),
    author: String(payload.author || "").trim(),
    role: String(payload.role || "").trim(),
    rating,
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
