import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerris";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];
const SERVICES_MENU_PATH = ["projects", PROJECT_ID, "navbarServicesMenu"];

export const DEFAULT_NAVBAR_SETTINGS = {
  ctaLabel: "Start a Project",
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

function normalizeServicesMenuItem(payload = {}) {
  return {
    slug: String(payload.slug || "").trim(),
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    icon: String(payload.icon || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- services ------------------------------- */

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_NAVBAR_SETTINGS);
const primaryService = createCollectionCrudService(PRIMARY_PATH, { normalize: normalizePrimary });
const servicesMenuService = createCollectionCrudService(SERVICES_MENU_PATH, { normalize: normalizeServicesMenuItem });

/* ------------------------------- settings -------------------------------- */

export const subscribeNavbarSettings = settingsService.subscribe;
export function saveNavbarSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}

/* ---------------------------- primary links ------------------------------ */

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;

/* -------------------------- services mega-menu --------------------------- */
/* Offerris's mega-menu copy lives in `nav.json.servicesMenu` with its own
   short descriptions — kept as its own collection instead of deriving from
   the `services` module. */

export const subscribeServicesMenuItems = servicesMenuService.subscribe;
export const createServicesMenuItem = servicesMenuService.create;
export const updateServicesMenuItem = servicesMenuService.update;
export const deleteServicesMenuItem = servicesMenuService.remove;
export const toggleServicesMenuItemStatus = servicesMenuService.toggleActive;
