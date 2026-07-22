import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const STORY_PATH = ["projects", PROJECT_ID, "about", "story"];
const STORY_IMAGE_PATH = ["projects", PROJECT_ID, "about", "storyImage"];
const VALUES_PATH = ["projects", PROJECT_ID, "about", "values"];
const TIMELINE_HEADING_PATH = ["projects", PROJECT_ID, "about", "timelineHeading"];
const CLOSING_PATH = ["projects", PROJECT_ID, "about", "closing"];
const ABOUT_VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];
const ABOUT_TIMELINE_PATH = ["projects", PROJECT_ID, "aboutTimeline"];

export const DEFAULT_ABOUT_HERO = {
  badge: "Our story",
  headline: "We help you skip the search and hop straight to the best offers.",
};

export const DEFAULT_ABOUT_STORY = {
  badge: "How it started",
  headline: "Built by people who were tired of hunting for coupons.",
  paragraphs: [
    "Offerhoppr started as a weekend project between friends who were sick of opening a dozen tabs just to find one working discount code.",
    "Today we've grown into a small, focused team that verifies deals daily so shoppers never have to guess if a code still works.",
  ],
};

export const DEFAULT_ABOUT_STORY_IMAGE = {
  url: "",
  alt: "Offerhoppr team at work",
  stickerTopLeft: "100% Verified",
  stickerBottomRight: "Since 2023",
  heading: "Every deal, checked by hand.",
  body: "No scraped codes, no dead links — our team tests every offer before it goes live.",
};

export const DEFAULT_ABOUT_VALUES = {
  eyebrow: "What we stand for",
  headline: "The things we won't compromise on.",
};

export const DEFAULT_ABOUT_TIMELINE_HEADING = {
  eyebrow: "Our journey",
  headline: "How Offerhoppr grew, step by step.",
};

export const DEFAULT_ABOUT_CLOSING = {
  headline: "Ready to start saving?",
  buttonLabel: "Browse Offers",
  buttonHref: "/offers",
};

function normalizeAboutValue(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeTimelineItem(payload) {
  return {
    year: String(payload.year || "").trim(),
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ------------------------------ singletons ------------------------------- */

const hero = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);
const story = createSingletonDocService(STORY_PATH, DEFAULT_ABOUT_STORY);
const storyImage = createSingletonDocService(STORY_IMAGE_PATH, DEFAULT_ABOUT_STORY_IMAGE);
const valuesDoc = createSingletonDocService(VALUES_PATH, DEFAULT_ABOUT_VALUES);
const timelineHeading = createSingletonDocService(TIMELINE_HEADING_PATH, DEFAULT_ABOUT_TIMELINE_HEADING);
const closing = createSingletonDocService(CLOSING_PATH, DEFAULT_ABOUT_CLOSING);

export const subscribeAboutHero = hero.subscribe;
export const saveAboutHero = hero.save;

export const subscribeAboutStory = story.subscribe;
/** `paragraphs` is stored as string[] — one entry per blank-line block. */
export async function saveAboutStory(payload) {
  const paragraphs = Array.isArray(payload.paragraphs)
    ? payload.paragraphs
    : String(payload.paragraphs || "").split(/\n\s*\n/);
  await story.save({
    badge: String(payload.badge || "").trim(),
    headline: String(payload.headline || "").trim(),
    paragraphs: paragraphs.map((block) => String(block || "").trim()).filter(Boolean),
  });
}

export const subscribeAboutStoryImage = storyImage.subscribe;
export const saveAboutStoryImage = storyImage.save;

export const subscribeAboutValuesDoc = valuesDoc.subscribe;
export const saveAboutValuesDoc = valuesDoc.save;

export const subscribeAboutTimelineHeading = timelineHeading.subscribe;
export const saveAboutTimelineHeading = timelineHeading.save;

export const subscribeAboutClosing = closing.subscribe;
export const saveAboutClosing = closing.save;

/* --------------------- aboutValues (collection) -------------------------- */

const values = createCollectionCrudService(ABOUT_VALUES_PATH, { normalize: normalizeAboutValue });

export const subscribeAboutValues = values.subscribe;
export const createAboutValue = values.create;
export const updateAboutValue = values.update;
export const deleteAboutValue = values.remove;
export const toggleAboutValueStatus = values.toggleActive;

/* -------------------- aboutTimeline (collection) -------------------------- */

const timeline = createCollectionCrudService(ABOUT_TIMELINE_PATH, { normalize: normalizeTimelineItem });

export const subscribeAboutTimeline = timeline.subscribe;
export const createAboutTimelineItem = timeline.create;
export const updateAboutTimelineItem = timeline.update;
export const deleteAboutTimelineItem = timeline.remove;
export const toggleAboutTimelineStatus = timeline.toggleActive;
