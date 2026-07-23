import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * TheStyleLife — About Us module data layer.
 *
 * One page, three sections (see CONTRACT.md) — entirely new fields; the
 * live About page (`AboutHero.jsx` + hardcoded `timeline`/`values` arrays in
 * `app/about/page.jsx`) is fully hardcoded today:
 *   about/hero      singleton — badge/heading/subcopy/CTAs/3 hero images/
 *                   since-badge text + collection aboutHeroStats (value/label)
 *   about/timeline  singleton — eyebrow/heading/body
 *                   + collection aboutTimeline (year/title/detail)
 *   about/values    singleton — eyebrow/heading/body + 2 illustration images
 *                   + collection aboutValues (title/description)
 *
 * Singleton DEFAULTS are prefilled with the live site's current hardcoded
 * copy so the admin shows real content on first load. Collections start
 * empty — the frontend's new `data/about.json` fallback still supplies
 * content for those until the admin adds rows (shophobia precedent).
 */

const PROJECT_ID = "thestylelife";
const ABOUT_DOC_PATH = (key) => ["projects", PROJECT_ID, "about", key];
const COLLECTION_PATH = (name) => ["projects", PROJECT_ID, name];

const cleanText = (value = "") => String(value ?? "").trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// 1) Hero — doc about/hero + collection aboutHeroStats
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_HERO = {
  badge: "The Studio",
  heading: "Part Design Studio. Part Newsroom.",
  subcopy:
    "We build brands with the same discipline a great editor brings to a cover story—considered, sharp, and never published half-finished.",
  primaryCtaLabel: "Start Your Project",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "View Our Work",
  secondaryCtaHref: "/work",
  image1: "https://officesnapshots.com/wp-content/uploads/2021/08/tech-company-office-design.jpeg",
  image2: "https://www.legalbites.in/wp-content/uploads/2016/09/Company_picture.jpg",
  image3:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6XyKINoUC2qn0l7JXQTmmS3ioWytzn1SAbZzHef-nblsJ43M9ZEX4LrQY&s=10",
  sinceBadgeText: "SINCE 2016",
};

const heroDoc = createSingletonDocService(ABOUT_DOC_PATH("hero"), DEFAULT_ABOUT_HERO);

export const subscribeAboutHero = heroDoc.subscribe;

export function saveAboutHero(payload) {
  return heroDoc.save({
    badge: cleanText(payload.badge),
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    primaryCtaLabel: cleanText(payload.primaryCtaLabel),
    primaryCtaHref: cleanText(payload.primaryCtaHref),
    secondaryCtaLabel: cleanText(payload.secondaryCtaLabel),
    secondaryCtaHref: cleanText(payload.secondaryCtaHref),
    image1: cleanText(payload.image1),
    image2: cleanText(payload.image2),
    image3: cleanText(payload.image3),
    sinceBadgeText: cleanText(payload.sinceBadgeText),
  });
}

const heroImage1Uploader = createImageUploader({ pathPrefix: "thestylelife/about/hero-1" });
const heroImage2Uploader = createImageUploader({ pathPrefix: "thestylelife/about/hero-2" });
const heroImage3Uploader = createImageUploader({ pathPrefix: "thestylelife/about/hero-3" });
export const uploadAboutHeroImage1 = heroImage1Uploader.upload;
export const uploadAboutHeroImage2 = heroImage2Uploader.upload;
export const uploadAboutHeroImage3 = heroImage3Uploader.upload;

function normalizeHeroStat(payload) {
  return {
    value: cleanText(payload.value),
    label: cleanText(payload.label),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const heroStatsCollection = createCollectionCrudService(COLLECTION_PATH("aboutHeroStats"), {
  normalize: normalizeHeroStat,
  orderByField: "order",
});

export const subscribeAboutHeroStats = heroStatsCollection.subscribe;
export const createAboutHeroStat = heroStatsCollection.create;
export const updateAboutHeroStat = heroStatsCollection.update;
export const deleteAboutHeroStat = heroStatsCollection.remove;
export const toggleAboutHeroStatStatus = heroStatsCollection.toggleActive;

// ---------------------------------------------------------------------------
// 2) Timeline — doc about/timeline + collection aboutTimeline
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TIMELINE = {
  eyebrow: "The Record",
  heading: "Nine years, documented.",
  body: "A brief timeline of how a stylist's eye and an engineer's discipline ended up under one roof.",
};

const timelineDoc = createSingletonDocService(ABOUT_DOC_PATH("timeline"), DEFAULT_ABOUT_TIMELINE);

export const subscribeAboutTimelineSection = timelineDoc.subscribe;

export function saveAboutTimelineSection(payload) {
  return timelineDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
  });
}

function normalizeTimelineItem(payload) {
  return {
    year: cleanText(payload.year),
    title: cleanText(payload.title),
    detail: cleanText(payload.detail),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const timelineCollection = createCollectionCrudService(COLLECTION_PATH("aboutTimeline"), {
  normalize: normalizeTimelineItem,
  orderByField: "order",
});

export const subscribeAboutTimelineItems = timelineCollection.subscribe;
export const createAboutTimelineItem = timelineCollection.create;
export const updateAboutTimelineItem = timelineCollection.update;
export const deleteAboutTimelineItem = timelineCollection.remove;
export const toggleAboutTimelineItemStatus = timelineCollection.toggleActive;

// ---------------------------------------------------------------------------
// 3) Values — doc about/values + collection aboutValues
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_VALUES = {
  eyebrow: "The Code",
  heading: "What we won't compromise on.",
  body: "Four operating principles that guide every project from strategy through launch.",
  image1: "https://www.middlemarketcenter.org/Media/Expert%20Perspectives%20Images/webdesignconcept_206418.jpg",
  image2:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpwZ1LtOagapna4ENYAMvxZeJPn7m6IMuJQfL3wj0YCZhBymlFzBAE8hE&s=10",
};

const valuesDoc = createSingletonDocService(ABOUT_DOC_PATH("values"), DEFAULT_ABOUT_VALUES);

export const subscribeAboutValuesSection = valuesDoc.subscribe;

export function saveAboutValuesSection(payload) {
  return valuesDoc.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    body: cleanText(payload.body),
    image1: cleanText(payload.image1),
    image2: cleanText(payload.image2),
  });
}

const valuesImage1Uploader = createImageUploader({ pathPrefix: "thestylelife/about/values-1" });
const valuesImage2Uploader = createImageUploader({ pathPrefix: "thestylelife/about/values-2" });
export const uploadAboutValuesImage1 = valuesImage1Uploader.upload;
export const uploadAboutValuesImage2 = valuesImage2Uploader.upload;

function normalizeValueItem(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const valueItemsCollection = createCollectionCrudService(COLLECTION_PATH("aboutValues"), {
  normalize: normalizeValueItem,
  orderByField: "order",
});

export const subscribeAboutValueItems = valueItemsCollection.subscribe;
export const createAboutValueItem = valueItemsCollection.create;
export const updateAboutValueItem = valueItemsCollection.update;
export const deleteAboutValueItem = valueItemsCollection.remove;
export const toggleAboutValueItemStatus = valueItemsCollection.toggleActive;
