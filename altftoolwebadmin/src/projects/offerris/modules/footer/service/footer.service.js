import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerris";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const QUICK_LINKS_PATH = ["projects", PROJECT_ID, "footerQuickLinks"];
const RESOURCES_PATH = ["projects", PROJECT_ID, "footerResources"];

export const DEFAULT_FOOTER_SETTINGS = {
  quickLinksHeading: "Quick Links",
  servicesHeading: "Services",
  newsletterHeading: "Get the Pulse",
  newsletterBody: "One email a month. Growth tactics, design breakdowns, zero fluff.",
  newsletterPlaceholder: "you@company.com",
  newsletterCtaLabel: "Subscribe",
  newsletterSuccess: "You're on the list. Welcome aboard.",
  copyrightSuffix: "All rights reserved.",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    quickLinksHeading: String(payload.quickLinksHeading || "").trim(),
    servicesHeading: String(payload.servicesHeading || "").trim(),
    newsletterHeading: String(payload.newsletterHeading || "").trim(),
    newsletterBody: String(payload.newsletterBody || "").trim(),
    newsletterPlaceholder: String(payload.newsletterPlaceholder || "").trim(),
    newsletterCtaLabel: String(payload.newsletterCtaLabel || "").trim(),
    newsletterSuccess: String(payload.newsletterSuccess || "").trim(),
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

/* ------------------------------- settings -------------------------------- */

export const subscribeFooterSettings = settingsService.subscribe;
export function saveFooterSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

/* ----------------------------- quick links -------------------------------- */
/* Promotes nav.json's `footerQuickLinks` array. */

export const subscribeFooterQuickLinks = quickLinksService.subscribe;
export const createFooterQuickLink = quickLinksService.create;
export const updateFooterQuickLink = quickLinksService.update;
export const deleteFooterQuickLink = quickLinksService.remove;
export const toggleFooterQuickLinkStatus = quickLinksService.toggleActive;

/* ------------------------------ resources -------------------------------- */
/* Promotes nav.json's `footerResources` array. The footer's services column
   stays derived from the `services` module — there is intentionally no
   separate services collection here. */

export const subscribeFooterResources = resourcesService.subscribe;
export const createFooterResource = resourcesService.create;
export const updateFooterResource = resourcesService.update;
export const deleteFooterResource = resourcesService.remove;
export const toggleFooterResourceStatus = resourcesService.toggleActive;
