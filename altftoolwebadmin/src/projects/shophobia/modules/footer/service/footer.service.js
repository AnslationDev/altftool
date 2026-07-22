import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Footer module data layer.
 *
 * Doc `projects/shophobia/footer/settings` (column headings + newsletter
 * blurb + copyright suffix) plus the `footerQuickLinks` / `footerResources`
 * collections. The footer's services column derives from the `services`
 * module; the newsletter form copy comes from `home/newsletter`. See
 * CONTRACT.md.
 */

const PROJECT_ID = "shophobia";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const QUICK_LINKS_PATH = ["projects", PROJECT_ID, "footerQuickLinks"];
const RESOURCES_PATH = ["projects", PROJECT_ID, "footerResources"];

export const DEFAULT_FOOTER_SETTINGS = {
  quickLinksHeading: "Quick Links",
  servicesHeading: "Services",
  newsletterHeading: "Newsletter",
  newsletterBlurb: "Monthly signal, zero spam.",
  copyrightSuffix: "All rights reserved.",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    quickLinksHeading: String(payload.quickLinksHeading || "").trim(),
    servicesHeading: String(payload.servicesHeading || "").trim(),
    newsletterHeading: String(payload.newsletterHeading || "").trim(),
    newsletterBlurb: String(payload.newsletterBlurb || "").trim(),
    copyrightSuffix: String(payload.copyrightSuffix || "").trim(),
  };
}

function normalizeLink(payload = {}) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- services ------------------------------- */

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_FOOTER_SETTINGS);
const quickLinksService = createCollectionCrudService(QUICK_LINKS_PATH, { normalize: normalizeLink });
const resourcesService = createCollectionCrudService(RESOURCES_PATH, { normalize: normalizeLink });

export const subscribeFooterSettings = settingsService.subscribe;
export function saveFooterSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

export const subscribeQuickLinks = quickLinksService.subscribe;
export const createQuickLink = quickLinksService.create;
export const updateQuickLink = quickLinksService.update;
export const deleteQuickLink = quickLinksService.remove;
export const toggleQuickLinkStatus = quickLinksService.toggleActive;

export const subscribeResources = resourcesService.subscribe;
export const createResource = resourcesService.create;
export const updateResource = resourcesService.update;
export const deleteResource = resourcesService.remove;
export const toggleResourceStatus = resourcesService.toggleActive;
