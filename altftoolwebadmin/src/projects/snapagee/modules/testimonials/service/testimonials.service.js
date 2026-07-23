import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Testimonials module data layer.
 *
 * Pure collection CRUD at `projects/snapagee/testimonials`. Fields are
 * `quote`/`name`/`role`/`company`, matching `data/testimonials.json` exactly
 * (the section heading lives in the home module's `testimonialsIntro` doc).
 * Every doc carries a numeric `order` and a boolean `active` (default true).
 *
 * NOTE: unlike TheStyleLife, Snapagee's testimonials have NO `rating`
 * field — `data/testimonials.json` doesn't carry one, so it isn't invented
 * here.
 *
 * The collection starts empty on purpose — the frontend's JSON fallback
 * already has all 7 real testimonials.
 */

const PROJECT_ID = "snapagee";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

function normalizeTestimonial(payload) {
  return {
    quote: String(payload.quote || "").trim(),
    name: String(payload.name || "").trim(),
    role: String(payload.role || "").trim(),
    company: String(payload.company || "").trim(),
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
