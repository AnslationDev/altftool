import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * TheStyleLife — Navbar module data layer.
 *
 * Doc `projects/thestylelife/navbar/settings` (CTA button only) plus the
 * `navbarPrimary` collection. See CONTRACT.md.
 *
 * Differences vs the Shophobia template:
 *   - no mega-menu footer strip fields (`megaMenuFooterText` /
 *     `megaMenuFooterCtaLabel`) — TheStyleLife's navbar settings doc is just
 *     the CTA button
 *   - primary links carry no `megaMenu` boolean — the Header's services
 *     mega-dropdown derives from the `services` module directly
 */

const PROJECT_ID = "thestylelife";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

export const DEFAULT_NAVBAR_SETTINGS = {
  ctaLabel: "Start Your Story",
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
