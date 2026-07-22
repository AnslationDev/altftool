import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Offerris — Testimonials module data layer.
 *
 * Pure collection CRUD at `projects/offerris/testimonials`. Fields are
 * `role`/`company`/`rating`, matching `data/testimonials.json` exactly (the
 * section heading lives in the home module's `testimonialsIntro` doc). Every
 * doc carries a numeric `order` and a boolean `active` (default true).
 */

const PROJECT_ID = "offerris";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

/** Rating is a 1-5 number; defaults to 5 when missing/invalid. */
function cleanRating(value) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function normalizeTestimonial(payload) {
  return {
    quote: String(payload.quote || "").trim(),
    name: String(payload.name || "").trim(),
    role: String(payload.role || "").trim(),
    company: String(payload.company || "").trim(),
    rating: cleanRating(payload.rating),
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
