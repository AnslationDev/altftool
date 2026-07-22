import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const STORY_PATH = ["projects", PROJECT_ID, "about", "story"];
const VALUES_PATH = ["projects", PROJECT_ID, "about", "values"];
const SELECTED_WORK_PATH = ["projects", PROJECT_ID, "about", "selectedWork"];
const CLOSING_PATH = ["projects", PROJECT_ID, "about", "closing"];
const ABOUT_VALUES_PATH = ["projects", PROJECT_ID, "aboutValues"];

export const VALUE_ICONS = ["hand", "compass", "house", "heart"];

export const DEFAULT_ABOUT_HERO = {
  badge: "Our story",
  headingLead: "A studio built",
  headingItalic: "on purpose",
  headingTail: ", kept small on purpose.",
  intro: "Here's the longer version of how we got here — and why we're staying this size.",
};

export const DEFAULT_ABOUT_STORY = {
  paragraphs: [
    "CampianAstra started the way a lot of good things start — with frustration. Our founder, Marisol, spent eight years at agencies where every brief passed through four sets of hands before it reached someone who actually opened a design file. The work suffered for it, and so did the people making it.",
    "So in 2016, she opened CampianAstra around a literal kitchen table, with one rule: the people you talk to are the people doing the work. No account layers, no junior bench quietly picking up the slack on senior promises.",
    "Nine years later, that rule hasn't changed, even as the studio has grown into a team of fourteen. We still keep our client list small on purpose. We'd rather do fewer projects exceptionally well than spread ourselves thin chasing scale for its own sake.",
    "The name comes from the Latin for 'golden' — aurum. It's a nod to the warm, tactile, handmade quality we chase in every project: nothing manufactured, nothing generic, everything a little bit gold.",
  ],
};

export const DEFAULT_ABOUT_VALUES = {
  eyebrow: "What we hold onto",
  heading: "Four things we won't compromise on.",
  headingItalic: "won't compromise on.",
};

export const DEFAULT_ABOUT_SELECTED_WORK = {
  eyebrow: "Selected work",
  heading: "A few brands we've helped along the way.",
  headingItalic: "helped along the way.",
};

export const DEFAULT_ABOUT_CLOSING = {
  quote: "",
  ctaLabel: "Start a Conversation",
  ctaHref: "/contact",
};

function normalizeValue(payload) {
  const icon = String(payload.icon || "").trim();
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    icon: VALUE_ICONS.includes(icon) ? icon : "hand",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ------------------------------ singletons ------------------------------- */

const hero = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);
const story = createSingletonDocService(STORY_PATH, DEFAULT_ABOUT_STORY);
const valuesDoc = createSingletonDocService(VALUES_PATH, DEFAULT_ABOUT_VALUES);
const selectedWork = createSingletonDocService(SELECTED_WORK_PATH, DEFAULT_ABOUT_SELECTED_WORK);
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
    paragraphs: paragraphs.map((block) => String(block || "").trim()).filter(Boolean),
  });
}

export const subscribeAboutValuesDoc = valuesDoc.subscribe;
export const saveAboutValuesDoc = valuesDoc.save;

export const subscribeAboutSelectedWork = selectedWork.subscribe;
export const saveAboutSelectedWork = selectedWork.save;

export const subscribeAboutClosing = closing.subscribe;
export const saveAboutClosing = closing.save;

/* --------------------- aboutValues (collection) -------------------------- */

const values = createCollectionCrudService(ABOUT_VALUES_PATH, { normalize: normalizeValue });

export const subscribeAboutValues = values.subscribe;
export const createAboutValue = values.create;
export const updateAboutValue = values.update;
export const deleteAboutValue = values.remove;
export const toggleAboutValueStatus = values.toggleActive;
