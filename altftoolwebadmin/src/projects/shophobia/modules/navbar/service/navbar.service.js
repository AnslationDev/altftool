import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Navbar module data layer.
 *
 * Doc `projects/shophobia/navbar/settings` (CTA + mega-menu footer strip)
 * plus the `navbarPrimary` collection. The services mega-menu content
 * derives from the `services` module on the frontend — no menu collection
 * here (unlike offerris). See CONTRACT.md.
 */

const PROJECT_ID = "shophobia";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

export const DEFAULT_NAVBAR_SETTINGS = {
  ctaLabel: "Enter the Drop",
  ctaHref: "/contact",
  megaMenuFooterText: "See the full lineup",
  megaMenuFooterCtaLabel: "All Services",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  return {
    ctaLabel: String(payload.ctaLabel || "").trim(),
    ctaHref: String(payload.ctaHref || "").trim(),
    megaMenuFooterText: String(payload.megaMenuFooterText || "").trim(),
    megaMenuFooterCtaLabel: String(payload.megaMenuFooterCtaLabel || "").trim(),
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

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;
