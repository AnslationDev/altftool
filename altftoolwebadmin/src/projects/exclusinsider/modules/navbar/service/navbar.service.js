import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "exclusinsider";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

export const DEFAULT_NAVBAR_SETTINGS = {
  ctaLabel: "Request Access",
  ctaHref: "/contact",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    ctaLabel: String(payload.ctaLabel || "").trim(),
    ctaHref: String(payload.ctaHref || "").trim(),
  };
}

function normalizePrimary(payload = {}) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    megaMenu: payload.megaMenu === true,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- services ------------------------------- */

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_NAVBAR_SETTINGS);
const primaryService = createCollectionCrudService(PRIMARY_PATH, { normalize: normalizePrimary });

/* ------------------------------- settings -------------------------------- */

export const subscribeNavbarSettings = settingsService.subscribe;
export function saveNavbarSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

/* ---------------------------- primary links ------------------------------ */
/* The Services mega-menu stays derived entirely from the `services` module
   on the frontend — there is no separate mega-menu collection here. */

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;
