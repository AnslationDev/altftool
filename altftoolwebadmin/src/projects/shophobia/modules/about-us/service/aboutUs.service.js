import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Shophobia — About Us module data layer.
 *
 * One page, three sections (see CONTRACT.md):
 *   about/hero        singleton — badge/heading/intro ({founded} placeholder)
 *   about/values      singleton + collection aboutValues (title/description/image)
 *   about/teamSection singleton — heading above the team strip (members come
 *                     from the Team module; story copy derives from home/about)
 */

const PROJECT_ID = "shophobia";
const ABOUT_DOC_PATH = (key) => ["projects", PROJECT_ID, "about", key];
const VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];

const cleanText = (value = "") => String(value ?? "").trim();

// ---------------------------------------------------------------------------
// 1) Hero — doc about/hero
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_HERO = {
  badge: "Our Story",
  heading: "Built By Internet Natives, For Brands That Refuse To Blend In",
  intro:
    "Founded in {founded}, we've grown from a two-person studio into a full-stack creative and engineering team without losing the chip on our shoulder.",
};

const heroDoc = createSingletonDocService(ABOUT_DOC_PATH("hero"), DEFAULT_ABOUT_HERO);

export const subscribeAboutHero = heroDoc.subscribe;

export function saveAboutHero(payload) {
  return heroDoc.save({
    badge: cleanText(payload.badge),
    heading: cleanText(payload.heading),
    intro: cleanText(payload.intro),
  });
}

// ---------------------------------------------------------------------------
// 2) Values — doc about/values + collection aboutValues
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_VALUES = {
  eyebrow: "What We Stand On",
  heading: "The Values That Drive Every Project",
  description: "Our principles shape every decision, from strategy to launch.",
};

const valuesDoc = createSingletonDocService(ABOUT_DOC_PATH("values"), DEFAULT_ABOUT_VALUES);

export const subscribeAboutValues = valuesDoc.subscribe;

export function saveAboutValues(payload) {
  return valuesDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    description: cleanText(payload.description),
  });
}

function normalizeValueItem(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    image: cleanText(payload.image),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const valueItemsService = createCollectionCrudService(VALUES_PATH, {
  normalize: normalizeValueItem,
  orderByField: "order",
});

export const subscribeAboutValueItems = valueItemsService.subscribe;
export const createAboutValueItem = valueItemsService.create;
export const updateAboutValueItem = valueItemsService.update;
export const deleteAboutValueItem = valueItemsService.remove;
export const toggleAboutValueItemStatus = valueItemsService.toggleActive;

const valueImageUploader = createImageUploader({ pathPrefix: "shophobia/about/value" });
export const uploadAboutValueImage = valueImageUploader.upload;

// ---------------------------------------------------------------------------
// 3) Team section heading — doc about/teamSection
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TEAM_SECTION = {
  eyebrow: "The Collective",
  heading: "Meet The Full Studio",
};

const teamSectionDoc = createSingletonDocService(
  ABOUT_DOC_PATH("teamSection"),
  DEFAULT_ABOUT_TEAM_SECTION,
);

export const subscribeAboutTeamSection = teamSectionDoc.subscribe;

export function saveAboutTeamSection(payload) {
  return teamSectionDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}
