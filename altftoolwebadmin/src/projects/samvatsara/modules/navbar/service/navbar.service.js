import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "samvatsara";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];
const SERVICES_PATH = ["projects", PROJECT_ID, "navbarServices"];

export const DEFAULT_NAVBAR_SETTINGS = {
  logoType: "text",
  logoText: "Samvatsara",
  logoImageUrl: "",
  logoImagePath: "",
  cta: { label: "Let's Create Together", href: "/contact" },
};

/* ------------------------------- normalize ------------------------------- */

function normalizeSettings(payload = {}) {
  const logoType = payload.logoType === "image" ? "image" : "text";
  return {
    logoType,
    logoText: String(payload.logoText || "").trim(),
    logoImageUrl: String(payload.logoImageUrl || "").trim(),
    logoImagePath: String(payload.logoImagePath || "").trim(),
    cta: {
      label: String(payload.cta?.label || "").trim(),
      href: String(payload.cta?.href || "").trim(),
    },
  };
}

function normalizePrimary(payload = {}) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    hasMega: payload.hasMega === true,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeService(payload = {}) {
  return {
    slug: String(payload.slug || "").trim(),
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    icon: String(payload.icon || "web").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* -------------------------------- services ------------------------------- */

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_NAVBAR_SETTINGS);
const primaryService = createCollectionCrudService(PRIMARY_PATH, { normalize: normalizePrimary });
const servicesService = createCollectionCrudService(SERVICES_PATH, { normalize: normalizeService });
const logoUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/navbar/logo` });

/* ------------------------------- settings -------------------------------- */

export const subscribeNavbarSettings = settingsService.subscribe;
export function saveNavbarSettings(payload) {
  return settingsService.save(normalizeSettings(payload));
}
export const uploadNavbarLogo = logoUploader.upload;
export const deleteNavbarLogo = logoUploader.remove;

/* ---------------------------- primary links ------------------------------ */

export const subscribeNavbarPrimary = primaryService.subscribe;
export const createNavbarPrimary = primaryService.create;
export const updateNavbarPrimary = primaryService.update;
export const deleteNavbarPrimary = primaryService.remove;
export const toggleNavbarPrimaryStatus = primaryService.toggleActive;

/* --------------------------- services mega-menu -------------------------- */

export const subscribeNavbarServices = servicesService.subscribe;
export const createNavbarService = servicesService.create;
export const updateNavbarService = servicesService.update;
export const deleteNavbarService = servicesService.remove;
export const toggleNavbarServiceStatus = servicesService.toggleActive;
