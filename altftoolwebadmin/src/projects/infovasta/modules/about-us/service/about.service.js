import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const MAIN_PATH = ["projects", PROJECT_ID, "about", "main"];
const PAGE_PATH = ["projects", PROJECT_ID, "pages", "about"];
const STATS_PATH = ["projects", PROJECT_ID, "aboutStats"];
const VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];
const TIMELINE_PATH = ["projects", PROJECT_ID, "aboutTimeline"];

/* --------------------------------- main ----------------------------------- */

export const DEFAULT_ABOUT_MAIN = {
  mission:
    "To help ambitious brands grow online by combining data-driven marketing with product-quality design and engineering.",
  vision:
    "A world where every growing business has access to enterprise-grade digital marketing, not just the companies who can afford a Fortune 500 agency.",
};

/* ------------------------------ page content ------------------------------ */

export const DEFAULT_ABOUT_PAGE = {
  meta: { title: "About Us", description: "" },
  hero: { eyebrow: "About Us", title: "We help brands", highlight: "grow online", description: "" },
  story: {
    eyebrow: "Our Story",
    heading: "Built by people who've shipped this work themselves",
    image: "",
    imageAlt: "",
    paragraphs: [],
  },
  missionLabel: "Our Mission",
  missionIcon: "rocket-outline",
  visionLabel: "Our Vision",
  visionIcon: "eye-outline",
  valuesSection: { eyebrow: "Why Choose Us", heading: "What makes us different" },
  timelineSection: { eyebrow: "Our Journey", heading: "Company highlights" },
  cta: { heading: "Ready to grow your brand?", label: "Get In Touch", href: "/contact-us" },
};

function normalizePage(payload) {
  const paragraphs = Array.isArray(payload.story?.paragraphs)
    ? payload.story.paragraphs
    : String(payload.story?.paragraphs || "").split(/\n\s*\n/);

  return {
    meta: {
      title: String(payload.meta?.title || "").trim(),
      description: String(payload.meta?.description || "").trim(),
    },
    hero: {
      eyebrow: String(payload.hero?.eyebrow || "").trim(),
      title: String(payload.hero?.title || "").trim(),
      highlight: String(payload.hero?.highlight || "").trim(),
      description: String(payload.hero?.description || "").trim(),
    },
    story: {
      eyebrow: String(payload.story?.eyebrow || "").trim(),
      heading: String(payload.story?.heading || "").trim(),
      image: String(payload.story?.image || "").trim(),
      imageAlt: String(payload.story?.imageAlt || "").trim(),
      paragraphs: paragraphs.map((block) => String(block || "").trim()).filter(Boolean),
    },
    missionLabel: String(payload.missionLabel || "").trim(),
    missionIcon: String(payload.missionIcon || "").trim(),
    visionLabel: String(payload.visionLabel || "").trim(),
    visionIcon: String(payload.visionIcon || "").trim(),
    valuesSection: {
      eyebrow: String(payload.valuesSection?.eyebrow || "").trim(),
      heading: String(payload.valuesSection?.heading || "").trim(),
    },
    timelineSection: {
      eyebrow: String(payload.timelineSection?.eyebrow || "").trim(),
      heading: String(payload.timelineSection?.heading || "").trim(),
    },
    cta: {
      heading: String(payload.cta?.heading || "").trim(),
      label: String(payload.cta?.label || "").trim(),
      href: String(payload.cta?.href || "").trim(),
    },
  };
}

/* ------------------------------ stats/values/timeline --------------------- */

function normalizeStat(payload) {
  return {
    label: String(payload.label || "").trim(),
    value: Number(payload.value) || 0,
    suffix: String(payload.suffix || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeValue(payload) {
  return {
    title: String(payload.title || "").trim(),
    icon: String(payload.icon || "").trim(),
    color: String(payload.color || "").trim(),
    text: String(payload.text || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeTimelineItem(payload) {
  return {
    year: String(payload.year || "").trim(),
    title: String(payload.title || "").trim(),
    text: String(payload.text || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ------------------------------ singletons --------------------------------- */

const main = createSingletonDocService(MAIN_PATH, DEFAULT_ABOUT_MAIN);
export const subscribeAboutMain = main.subscribe;
export const saveAboutMain = main.save;

const page = createSingletonDocService(PAGE_PATH, DEFAULT_ABOUT_PAGE);
export const subscribeAboutPage = page.subscribe;
export async function saveAboutPage(payload) {
  await page.save(normalizePage(payload));
}

/* -------------------------------- collections ------------------------------ */

const stats = createCollectionCrudService(STATS_PATH, { normalize: normalizeStat });
export const subscribeAboutStats = stats.subscribe;
export const createAboutStat = stats.create;
export const updateAboutStat = stats.update;
export const deleteAboutStat = stats.remove;
export const toggleAboutStatStatus = stats.toggleActive;

const values = createCollectionCrudService(VALUES_PATH, { normalize: normalizeValue });
export const subscribeAboutValues = values.subscribe;
export const createAboutValue = values.create;
export const updateAboutValue = values.update;
export const deleteAboutValue = values.remove;
export const toggleAboutValueStatus = values.toggleActive;

const timeline = createCollectionCrudService(TIMELINE_PATH, { normalize: normalizeTimelineItem });
export const subscribeAboutTimeline = timeline.subscribe;
export const createAboutTimelineItem = timeline.create;
export const updateAboutTimelineItem = timeline.update;
export const deleteAboutTimelineItem = timeline.remove;
export const toggleAboutTimelineItemStatus = timeline.toggleActive;
