import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Privacy Policy module data layer.
 *
 * Single doc `projects/shophobia/legal/privacy` with an inline `sections`
 * array (see CONTRACT.md). `{siteEmail}` / `{siteName}` placeholders are
 * interpolated client-side by the frontend from site settings.
 */

const PROJECT_ID = "shophobia";
const POLICY_PATH = ["projects", PROJECT_ID, "legal", "privacy"];

export const DEFAULT_POLICY = {
  title: "Privacy Policy",
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

const service = createSingletonDocService(POLICY_PATH, DEFAULT_POLICY);

export const subscribePolicy = service.subscribe;

export function savePolicy(payload) {
  return service.save({
    title: cleanText(payload.title),
    lastUpdated: cleanText(payload.lastUpdated),
    sections: cleanSections(payload.sections),
  });
}
