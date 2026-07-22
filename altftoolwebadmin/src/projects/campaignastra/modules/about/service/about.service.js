import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "campaignastra";

const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const MISSION_VISION_PATH = ["projects", PROJECT_ID, "about", "mission-vision"];
const VALUES_SETTINGS_PATH = ["projects", PROJECT_ID, "about", "values"];
const VALUES_ITEMS_PATH = ["projects", PROJECT_ID, "about", "values", "items"];
const TEAM_PREVIEW_PATH = ["projects", PROJECT_ID, "about", "team-preview"];

const cleanText = (value = "") => String(value).trim();

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_HERO = {
  eyebrow: "About Campaignastra",
  title: "We build growth systems, not just campaigns",
  subtitle: "A senior team obsessed with compounding results for ambitious brands.",
  seoTitle: "",
  seoDescription: "",
  active: true,
};

const heroService = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);
export const subscribeAboutHero = heroService.subscribe;
export const saveAboutHero = heroService.save;
export const resetAboutHero = heroService.reset;

// ---------------------------------------------------------------------------
// Mission & Vision
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_MISSION_VISION = {
  missionTitle: "Our Mission",
  missionText:
    "To help ambitious businesses build durable growth engines through clear strategy and relentless execution.",
  visionTitle: "Our Vision",
  visionText:
    "A web where brands grow through genuine value and honest marketing, not gimmicks.",
  active: true,
};

const missionVisionService = createSingletonDocService(
  MISSION_VISION_PATH,
  DEFAULT_ABOUT_MISSION_VISION,
);
export const subscribeAboutMissionVision = missionVisionService.subscribe;
export const saveAboutMissionVision = missionVisionService.save;
export const resetAboutMissionVision = missionVisionService.reset;

// ---------------------------------------------------------------------------
// Values (settings doc + items subcollection)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_VALUES_SETTINGS = {
  eyebrow: "What we stand for",
  title: "Our Values",
  active: true,
};

function normalizeValueItem(payload) {
  return {
    title: cleanText(payload.title),
    text: cleanText(payload.text),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const valuesSettingsService = createSingletonDocService(
  VALUES_SETTINGS_PATH,
  DEFAULT_ABOUT_VALUES_SETTINGS,
);
const valuesItemsService = createCollectionCrudService(VALUES_ITEMS_PATH, {
  normalize: normalizeValueItem,
  orderByField: "order",
});

export const subscribeAboutValuesSettings = valuesSettingsService.subscribe;
export const saveAboutValuesSettings = valuesSettingsService.save;
export const resetAboutValuesSettings = valuesSettingsService.reset;

export const subscribeAboutValueItems = valuesItemsService.subscribe;
export const createAboutValueItem = valuesItemsService.create;
export const updateAboutValueItem = valuesItemsService.update;
export const deleteAboutValueItem = valuesItemsService.remove;
export const toggleAboutValueItemStatus = valuesItemsService.toggleActive;

// ---------------------------------------------------------------------------
// Team preview (heading only — members come from the shared Team module)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TEAM_PREVIEW = {
  eyebrow: "Our people",
  title: "Team Preview",
  active: true,
};

const teamPreviewService = createSingletonDocService(
  TEAM_PREVIEW_PATH,
  DEFAULT_ABOUT_TEAM_PREVIEW,
);
export const subscribeAboutTeamPreview = teamPreviewService.subscribe;
export const saveAboutTeamPreview = teamPreviewService.save;
export const resetAboutTeamPreview = teamPreviewService.reset;
