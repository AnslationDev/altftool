import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Infovasta — FAQ module data layer.
 *
 * Collection `projects/infovasta/faqs`. This is the sitewide FAQ shown on the
 * homepage (FaqSection) — distinct from the per-service embedded `faq` array
 * handled by the services module. Every doc carries a numeric `order` and a
 * boolean `active` (default true).
 */

const PROJECT_ID = "infovasta";
const FAQS_PATH = ["projects", PROJECT_ID, "faqs"];

function normalizeFaq(payload) {
  return {
    q: String(payload.q || "").trim(),
    a: String(payload.a || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const faqsService = createCollectionCrudService(FAQS_PATH, {
  normalize: normalizeFaq,
  orderByField: "order",
});

export const subscribeFaqs = faqsService.subscribe;
export const createFaq = faqsService.create;
export const updateFaq = faqsService.update;
export const deleteFaq = faqsService.remove;
export const toggleFaqStatus = faqsService.toggleActive;
