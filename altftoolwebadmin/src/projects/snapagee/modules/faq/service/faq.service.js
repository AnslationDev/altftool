import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * Snapagee — FAQ module data layer.
 *
 * Collection `projects/snapagee/faqs`. This is the SITEWIDE faq list,
 * matching `data/faq.json` — shared by both `/contact` and `/services` on
 * the frontend, as today. Every doc carries a numeric `order` and a boolean
 * `active` (default true).
 *
 * The collection starts empty on purpose — the frontend's JSON fallback
 * already has all 8 real FAQs.
 */

const PROJECT_ID = "snapagee";
const FAQS_PATH = ["projects", PROJECT_ID, "faqs"];

function normalizeFaq(payload) {
  return {
    question: String(payload.question || "").trim(),
    answer: String(payload.answer || "").trim(),
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
