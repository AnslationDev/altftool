import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Offerris — About Us module data layer.
 *
 * Per CONTRACT.md, the About page is a single admin page composed of four
 * settings docs and three ordered collections:
 *   about/hero        singleton                      { badge, heading, image, imageAlt }
 *   —                 collection aboutStoryImages    { image, alt, order, active }
 *   about/values      singleton                      { eyebrow, heading }
 *   —                 collection aboutValues         { title, description, order, active }
 *   about/timeline    singleton                      { eyebrow, heading }
 *   —                 collection aboutTimeline       { year, title, description, order, active }
 *   about/leadership  singleton                      { eyebrow, heading, ctaLabel }
 */

const PROJECT_ID = "offerris";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const VALUES_INTRO_PATH = ["projects", PROJECT_ID, "about", "values"];
const TIMELINE_INTRO_PATH = ["projects", PROJECT_ID, "about", "timeline"];
const LEADERSHIP_PATH = ["projects", PROJECT_ID, "about", "leadership"];
const STORY_IMAGES_PATH = ["projects", PROJECT_ID, "aboutStoryImages"];
const VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];
const TIMELINE_PATH = ["projects", PROJECT_ID, "aboutTimeline"];

const cleanText = (value = "") => String(value ?? "").trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/* -------------------------------------------------------------------------- */
/* Hero — doc about/hero                                                      */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_HERO = {
  badge: "Our Story",
  heading: "Built by people who got tired of slow agencies.",
  image: "https://cdni.iconscout.com/illustration/free/thumb/free-idea-illustration-svg-download-png-1768732.png",
  imageAlt: "Digital marketing illustration",
};

const heroDoc = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);

export const subscribeAboutHero = heroDoc.subscribe;

export function saveAboutHero(payload) {
  return heroDoc.save({
    badge: cleanText(payload.badge),
    heading: cleanText(payload.heading),
    image: payload.image || "",
    imageAlt: cleanText(payload.imageAlt),
  });
}

const heroImageUploader = createImageUploader({ pathPrefix: "offerris/about/hero" });

export const uploadAboutHeroImage = heroImageUploader.upload;

/* -------------------------------------------------------------------------- */
/* Story Images — collection aboutStoryImages (the 3-image collage)           */
/* -------------------------------------------------------------------------- */
function normalizeStoryImage(payload) {
  return {
    image: payload.image || "",
    alt: cleanText(payload.alt),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const storyImagesCollection = createCollectionCrudService(STORY_IMAGES_PATH, {
  normalize: normalizeStoryImage,
  orderByField: "order",
});

export const subscribeAboutStoryImages = storyImagesCollection.subscribe;
export const createAboutStoryImage = storyImagesCollection.create;
export const updateAboutStoryImage = storyImagesCollection.update;
export const deleteAboutStoryImage = storyImagesCollection.remove;
export const toggleAboutStoryImageStatus = storyImagesCollection.toggleActive;

const storyImageUploader = createImageUploader({ pathPrefix: "offerris/about/story" });

export const uploadAboutStoryImage = storyImageUploader.upload;

/* -------------------------------------------------------------------------- */
/* Values — doc about/values + collection aboutValues                         */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_VALUES_INTRO = {
  eyebrow: "What We Believe",
  heading: "The principles behind every engagement.",
};

const valuesIntroDoc = createSingletonDocService(VALUES_INTRO_PATH, DEFAULT_ABOUT_VALUES_INTRO);

export const subscribeAboutValuesIntro = valuesIntroDoc.subscribe;

export function saveAboutValuesIntro(payload) {
  return valuesIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

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
/* Timeline — doc about/timeline + collection aboutTimeline                   */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_TIMELINE_INTRO = {
  eyebrow: "Our Timeline",
  heading: "From two people to a marketing  team.",
};

const timelineIntroDoc = createSingletonDocService(TIMELINE_INTRO_PATH, DEFAULT_ABOUT_TIMELINE_INTRO);

export const subscribeAboutTimelineIntro = timelineIntroDoc.subscribe;

export function saveAboutTimelineIntro(payload) {
  return timelineIntroDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
  });
}

function normalizeTimelineEntry(payload) {
  return {
    year: cleanText(payload.year),
    title: cleanText(payload.title),
    description: cleanText(payload.description),
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

/* -------------------------------------------------------------------------- */
/* Leadership — doc about/leadership (members derive from the team module)    */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ABOUT_LEADERSHIP = {
  eyebrow: "Leadership",
  heading: "The people steering the studio.",
  ctaLabel: "Meet the full team",
};

const leadershipDoc = createSingletonDocService(LEADERSHIP_PATH, DEFAULT_ABOUT_LEADERSHIP);

export const subscribeAboutLeadership = leadershipDoc.subscribe;

export function saveAboutLeadership(payload) {
  return leadershipDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    ctaLabel: cleanText(payload.ctaLabel),
  });
}
