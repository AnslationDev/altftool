import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "campaignastra";
const NAVBAR_SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const NAVBAR_ITEMS_PATH = ["projects", PROJECT_ID, "navbarItems"];

export const DEFAULT_NAVBAR_SETTINGS = {
  logoType: "text",
  logoText: "ANSLIC",
  logoImageUrl: "",
  logoImagePath: "",
  contactCtaLabel: "Contact",
};

const cleanText = (value = "") => String(value).trim();

function normalizeNavbarItem(payload) {
  return {
    title: cleanText(payload.title),
    url: cleanText(payload.url),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(NAVBAR_SETTINGS_PATH, DEFAULT_NAVBAR_SETTINGS);
const itemsService = createCollectionCrudService(NAVBAR_ITEMS_PATH, { normalize: normalizeNavbarItem });
const logoUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/navbar/logo` });

export const subscribeNavbarSettings = settingsService.subscribe;
export const saveNavbarSettings = settingsService.save;

export const subscribeNavbarItems = itemsService.subscribe;
export const createNavbarItem = itemsService.create;
export const updateNavbarItem = itemsService.update;
export const deleteNavbarItem = itemsService.remove;
export const toggleNavbarItemStatus = itemsService.toggleActive;

export const uploadNavbarLogo = logoUploader.upload;
export const deleteNavbarLogo = logoUploader.remove;
