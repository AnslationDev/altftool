import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "dealnbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

export const DEFAULT_NAVBAR_SETTINGS = {
  logoType: "text",
  logoText: "Dealnbook",
  logoImageUrl: "",
  imagePath: "",
  ctaLabel: "Get Started",
  ctaHref: "/contact",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  const logoType = payload.logoType === "image" ? "image" : "text";
  return {
    logoType,
    logoText: String(payload.logoText || "").trim(),
    logoImageUrl: String(payload.logoImageUrl || "").trim(),
    imagePath: String(payload.imagePath || "").trim(),
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
const logoUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/navbar/logo` });

/* ------------------------------- settings -------------------------------- */

export const subscribeNavbarSettings = settingsService.subscribe;
export function saveNavbarSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}
export const uploadNavbarLogo = logoUploader.upload;
export const deleteNavbarLogo = logoUploader.remove;

/* ---------------------------- primary links ------------------------------ */
/* The header's services dropdown is driven entirely by the `services`
   module — there is no separate mega-menu collection here. */

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;
