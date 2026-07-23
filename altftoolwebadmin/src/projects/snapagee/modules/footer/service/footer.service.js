import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Footer module data layer.
 *
 * Doc `projects/snapagee/footer/settings` (column headings + newsletter
 * blurb + copyright suffix) plus the `footerQuickLinks` collection. The
 * footer's Services column derives from the `services` module. See
 * CONTRACT.md.
 *
 * Differences vs the TheStyleLife template:
 *   - no `resourcesHeading` field / `footerResources` collection — Snapagee's
 *     footer has only Quick Links + Services + Newsletter columns, no
 *     Resources column
 */

const PROJECT_ID = "snapagee";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const QUICK_LINKS_PATH = ["projects", PROJECT_ID, "footerQuickLinks"];

export const DEFAULT_FOOTER_SETTINGS = {
  quickLinksHeading: "Quick Links",
  servicesHeading: "Services",
  newsletterHeading: "Newsletter",
  newsletterBlurb: "Field notes on growth, design, and engineering — once a month, no fluff.",
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

export const subscribeFooterSettings = settingsService.subscribe;
export function saveFooterSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

export const subscribeQuickLinks = quickLinksService.subscribe;
export const createQuickLink = quickLinksService.create;
export const updateQuickLink = quickLinksService.update;
export const deleteQuickLink = quickLinksService.remove;
export const toggleQuickLinkStatus = quickLinksService.toggleActive;
