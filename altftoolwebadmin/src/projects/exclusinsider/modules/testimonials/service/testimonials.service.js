import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * ExclusInsider — Testimonials module data layer.
 *
 * Pure collection CRUD at `projects/exclusinsider/testimonials`. Field is
 * `title`, not `role`/`company`, and there's a `result` field — matches
 * `data/testimonials.json` exactly. Every doc carries a numeric `order` and
 * a boolean `active` (default true).
 */

const PROJECT_ID = "exclusinsider";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

function normalizeTestimonial(payload) {
  return {
    quote: String(payload.quote || "").trim(),
    name: String(payload.name || "").trim(),
    title: String(payload.title || "").trim(),
    result: String(payload.result || "").trim(),
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
