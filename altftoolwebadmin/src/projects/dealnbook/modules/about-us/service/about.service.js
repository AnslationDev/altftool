import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dealnbook";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const PHILOSOPHY_PATH = ["projects", PROJECT_ID, "about", "philosophy"];
const PRINCIPLES_PATH = ["projects", PROJECT_ID, "aboutPrinciples"];

export const DEFAULT_ABOUT_HERO = {
  eyebrow: "Our story",
  heading: "We help you skip the search and book straight to the best deal.",
  imageUrl: "",
};

export const DEFAULT_ABOUT_PHILOSOPHY = {
  quote: "If we wouldn't book it ourselves, we don't list it.",
};

function normalizePrinciple(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ------------------------------ singletons ------------------------------- */

const hero = createSingletonDocService(HERO_PATH, DEFAULT_ABOUT_HERO);
const philosophy = createSingletonDocService(PHILOSOPHY_PATH, DEFAULT_ABOUT_PHILOSOPHY);

export const subscribeAboutHero = hero.subscribe;
export function saveAboutHero(payload) {
  return hero.save({
    eyebrow: String(payload.eyebrow || "").trim(),
    heading: String(payload.heading || "").trim(),
    imageUrl: String(payload.imageUrl || "").trim(),
  });
}

export const subscribeAboutPhilosophy = philosophy.subscribe;
export function saveAboutPhilosophy(payload) {
  return philosophy.save({ quote: String(payload.quote || "").trim() });
}

/* -------------------- aboutPrinciples (collection) -------------------------- */

const principles = createCollectionCrudService(PRINCIPLES_PATH, { normalize: normalizePrinciple });

export const subscribeAboutPrinciples = principles.subscribe;
export const createAboutPrinciple = principles.create;
export const updateAboutPrinciple = principles.update;
export const deleteAboutPrinciple = principles.remove;
export const toggleAboutPrincipleStatus = principles.toggleActive;
