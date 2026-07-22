import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const RESOURCES_PATH = ["projects", PROJECT_ID, "footerResources"];

export const DEFAULT_FOOTER_SETTINGS = {
  quickLinksHeading: "Quick Links",
  servicesHeading: "Services",
  resourcesHeading: "Resources",
  newsletterHeading: "Newsletter",
  copyrightText: "© Samvatsara. All rights reserved.",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    quickLinksHeading: String(payload.quickLinksHeading || "").trim(),
    servicesHeading: String(payload.servicesHeading || "").trim(),
    resourcesHeading: String(payload.resourcesHeading || "").trim(),
    newsletterHeading: String(payload.newsletterHeading || "").trim(),
    copyrightText: String(payload.copyrightText || "").trim(),
  };
}

function normalizeResource(payload = {}) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- services ------------------------------- */

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_FOOTER_SETTINGS);
const resourcesService = createCollectionCrudService(RESOURCES_PATH, { normalize: normalizeResource });

/* ------------------------------- settings -------------------------------- */

export const subscribeFooterSettings = settingsService.subscribe;
export function saveFooterSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

/* ------------------------------ resources -------------------------------- */

export const subscribeFooterResources = resourcesService.subscribe;
export const createFooterResource = resourcesService.create;
export const updateFooterResource = resourcesService.update;
export const deleteFooterResource = resourcesService.remove;
export const toggleFooterResourceStatus = resourcesService.toggleActive;
