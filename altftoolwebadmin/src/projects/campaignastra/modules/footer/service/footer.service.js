import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "campaignastra";
const FOOTER_SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];

export const DEFAULT_FOOTER_SETTINGS = {
  tagline: "Premium digital marketing, design, and growth systems for ambitious brands.",
  copyrightText: "Copyright 2026 {siteName}. All rights reserved.",
};

const settingsService = createSingletonDocService(FOOTER_SETTINGS_PATH, DEFAULT_FOOTER_SETTINGS);

export const subscribeFooterSettings = settingsService.subscribe;
export const saveFooterSettings = settingsService.save;
export const resetFooterSettings = settingsService.reset;
