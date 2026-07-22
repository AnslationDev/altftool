import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dealnbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const QUICK_LINKS_PATH = ["projects", PROJECT_ID, "footerQuickLinks"];
const RESOURCES_PATH = ["projects", PROJECT_ID, "footerResources"];

export const DEFAULT_FOOTER_SETTINGS = {
  newsletterHeading: "Newsletter",
  newsletterPlaceholder: "Enter your email",
  newsletterCtaLabel: "Subscribe",
  copyrightSuffix: "All rights reserved.",
  legalPrivacyLabel: "Privacy Policy",
  legalTermsLabel: "Terms & Conditions",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    newsletterHeading: String(payload.newsletterHeading || "").trim(),
    newsletterPlaceholder: String(payload.newsletterPlaceholder || "").trim(),
    newsletterCtaLabel: String(payload.newsletterCtaLabel || "").trim(),
    copyrightSuffix: String(payload.copyrightSuffix || "").trim(),
    legalPrivacyLabel: String(payload.legalPrivacyLabel || "").trim(),
    legalTermsLabel: String(payload.legalTermsLabel || "").trim(),
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

export const subscribeFooterQuickLinks = quickLinksService.subscribe;
export const createFooterQuickLink = quickLinksService.create;
export const updateFooterQuickLink = quickLinksService.update;
export const deleteFooterQuickLink = quickLinksService.remove;
export const toggleFooterQuickLinkStatus = quickLinksService.toggleActive;

/* ------------------------------ resources -------------------------------- */
/* The footer's services column stays derived from the `services` module —
   there is intentionally no separate services collection here. */

export const subscribeFooterResources = resourcesService.subscribe;
export const createFooterResource = resourcesService.create;
export const updateFooterResource = resourcesService.update;
export const deleteFooterResource = resourcesService.remove;
export const toggleFooterResourceStatus = resourcesService.toggleActive;
