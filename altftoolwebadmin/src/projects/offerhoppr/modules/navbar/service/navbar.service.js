import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "offerhoppr";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];

export const DEFAULT_NAVBAR_SETTINGS = {
  logoType: "text",
  logoText: "Offerhoppr",
  logoImageUrl: "",
  logoImagePath: "",
  mobileCtaLabel: "",
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  const logoType = payload.logoType === "image" ? "image" : "text";
  return {
    logoType,
    logoText: String(payload.logoText || "").trim(),
    logoImageUrl: String(payload.logoImageUrl || "").trim(),
    logoImagePath: String(payload.logoImagePath || "").trim(),
    mobileCtaLabel: String(payload.mobileCtaLabel || "").trim(),
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
/* Maps to offerhoppr's data/nav.json `primary` array — simple label+href
   links. The header services dropdown is driven entirely by the `services`
   module, not by navbar, so there is no "hasMega" field or services picker
   here (unlike samvatsara's mega-menu pattern). */

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;
