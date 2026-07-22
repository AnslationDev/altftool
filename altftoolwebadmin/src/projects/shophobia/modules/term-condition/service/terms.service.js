import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Terms & Conditions module data layer.
 *
 * Single doc `projects/shophobia/legal/terms` with an inline `sections`
 * array (see CONTRACT.md). `{siteEmail}` / `{siteName}` placeholders are
 * interpolated client-side by the frontend from site settings.
 */

const PROJECT_ID = "shophobia";
const TERMS_PATH = ["projects", PROJECT_ID, "legal", "terms"];

export const DEFAULT_TERMS = {
  title: "Terms & Conditions",
  lastUpdated: "July 16, 2026",
  sections: [],
};

const cleanText = (value = "") => String(value ?? "").trim();

function cleanSections(sections) {
  return (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      title: cleanText(section?.title),
      body: cleanText(section?.body),
    }))
    .filter((section) => section.title || section.body);
}

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;

export function saveTerms(payload) {
  return service.save({
    title: cleanText(payload.title),
    lastUpdated: cleanText(payload.lastUpdated),
    sections: cleanSections(payload.sections),
  });
}
