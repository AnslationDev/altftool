import { createCollectionCrudService } from "@/lib/firestoreCrud";

/**
 * ExclusInsider — FAQ module data layer.
 *
 * Collection `projects/exclusinsider/faqs`. This is the SITEWIDE faq shown on
 * the home page. Every doc carries a numeric `order` and a boolean `active`
 * (default true).
 */

const PROJECT_ID = "exclusinsider";
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
