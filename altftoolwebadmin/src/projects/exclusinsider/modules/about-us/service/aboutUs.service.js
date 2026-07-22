import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * ExclusInsider — About Us module data layer.
 *
 * Per CONTRACT.md, the About page is a single admin page composed of two
 * settings docs and three ordered collections:
 *   about/hero      singleton                       { heading, subheading }
 *   —               collection aboutValues           { title, description, order, active }
 *   about/story     singleton                       { eyebrowStory, headingStory, eyebrowJourney, headingJourney }
 *   —               collection aboutTimeline         { year, title, description, image, imagePath, order, active }
 *   —               collection aboutStats            { value, label, order, active }
 */

const PROJECT_ID = "exclusinsider";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const STORY_PATH = ["projects", PROJECT_ID, "about", "story"];
const VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];
const TIMELINE_PATH = ["projects", PROJECT_ID, "aboutTimeline"];
const STATS_PATH = ["projects", PROJECT_ID, "aboutStats"];

const cleanText = (value = "") => String(value ?? "").trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/* -------------------------------------------------------------------------- */
/* Hero — doc about/hero                                                      */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_HERO = {
  heading: "Not An Agency. A Standing Advantage.",
  subheading:
    "Most agencies compete for attention. We compete for restraint — fewer clients, deeper work, and a decade of results we've mostly kept to ourselves.",
};

const heroDoc = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);

export const subscribeAboutHero = heroDoc.subscribe;

export function saveAboutHero(payload) {
  return heroDoc.save({
    heading: cleanText(payload.heading),
    subheading: cleanText(payload.subheading),
  });
}

/* -------------------------------------------------------------------------- */
/* Values — collection aboutValues                                           */
/* -------------------------------------------------------------------------- */
function normalizeValue(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const valuesCollection = createCollectionCrudService(VALUES_PATH, {
  normalize: normalizeValue,
  orderByField: "order",
});

export const subscribeAboutValues = valuesCollection.subscribe;
export const createAboutValue = valuesCollection.create;
export const updateAboutValue = valuesCollection.update;
export const deleteAboutValue = valuesCollection.remove;
export const toggleAboutValueStatus = valuesCollection.toggleActive;

/* -------------------------------------------------------------------------- */
/* Story — doc about/story                                                    */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_STORY = {
  eyebrowStory: "Our Story",
  headingStory: "A Decade of Trust & Exclusive Growth",
  eyebrowJourney: "Our Journey",
  headingJourney: "The Record",
};

const storyDoc = createSingletonDocService(STORY_PATH, DEFAULT_ABOUT_STORY);

export const subscribeAboutStory = storyDoc.subscribe;

export function saveAboutStory(payload) {
  return storyDoc.save({
    eyebrowStory: cleanText(payload.eyebrowStory),
    headingStory: cleanText(payload.headingStory),
    eyebrowJourney: cleanText(payload.eyebrowJourney),
    headingJourney: cleanText(payload.headingJourney),
  });
}

/* -------------------------------------------------------------------------- */
/* Timeline — collection aboutTimeline (with image upload)                   */
/* -------------------------------------------------------------------------- */
function normalizeTimelineEntry(payload) {
  return {
    year: cleanText(payload.year),
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const timelineCollection = createCollectionCrudService(TIMELINE_PATH, {
  normalize: normalizeTimelineEntry,
  orderByField: "order",
});

export const subscribeAboutTimeline = timelineCollection.subscribe;
export const createAboutTimelineEntry = timelineCollection.create;
export const updateAboutTimelineEntry = timelineCollection.update;
export const deleteAboutTimelineEntry = timelineCollection.remove;
export const toggleAboutTimelineStatus = timelineCollection.toggleActive;

const timelineImageUploader = createImageUploader({ pathPrefix: "exclusinsider/about/timeline" });

export const uploadAboutTimelineImage = timelineImageUploader.upload;
export const deleteAboutTimelineImage = timelineImageUploader.remove;

/* -------------------------------------------------------------------------- */
/* Stats — collection aboutStats                                             */
/* -------------------------------------------------------------------------- */
function normalizeStat(payload) {
  return {
    value: cleanText(payload.value),
    label: cleanText(payload.label),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const statsCollection = createCollectionCrudService(STATS_PATH, {
  normalize: normalizeStat,
  orderByField: "order",
});

export const subscribeAboutStats = statsCollection.subscribe;
export const createAboutStat = statsCollection.create;
export const updateAboutStat = statsCollection.update;
export const deleteAboutStat = statsCollection.remove;
export const toggleAboutStatStatus = statsCollection.toggleActive;
