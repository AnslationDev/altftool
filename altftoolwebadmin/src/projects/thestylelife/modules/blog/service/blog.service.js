import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";
import { createSlug } from "../../services/service/services.service";

/**
 * TheStyleLife — Blog module data layer.
 *
 * Collection CRUD at `projects/thestylelife/blogArticles` plus a
 * `blog/settings` singleton for the `/blog` page hero and the detail page's
 * related strip (see CONTRACT.md). Article `content` is an array of
 * paragraph strings, edited as one blank-line-separated textarea in the
 * admin. Identical shape to Shophobia's blog module — PROJECT_ID change only.
 */

const PROJECT_ID = "thestylelife";
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];

const cleanText = (value = "") => String(value ?? "").trim();

/** Blank-line-separated textarea ⇄ paragraphs array. */
export function toParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizeArticle(payload) {
  return {
    slug: createSlug(payload.slug || payload.title),
    title: cleanText(payload.title),
    category: cleanText(payload.category),
    image: cleanText(payload.image),
    excerpt: cleanText(payload.excerpt),
    date: cleanText(payload.date),
    readTime: cleanText(payload.readTime),
    author: cleanText(payload.author),
    content: toParagraphs(payload.content),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const articlesService = createCollectionCrudService(ARTICLES_PATH, { normalize: normalizeArticle });

export const subscribeArticles = articlesService.subscribe;
export const createArticle = articlesService.create;
export const updateArticle = articlesService.update;
export const deleteArticle = articlesService.remove;
export const toggleArticleStatus = articlesService.toggleActive;

// ---------------------------------------------------------------------------
// /blog page hero + related strip — doc blog/settings
// ---------------------------------------------------------------------------
export const DEFAULT_BLOG_SETTINGS = {
  badge: "The Edit",
  heroHeadline: "Notes From the Studio.",
  heroSubcopy:
    "Thinking on brand, motion, and growth — published whenever we have something worth saying, in the studio's own voice.",
  relatedEyebrow: "Continue Reading",
  relatedHeading: "More From the Studio",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);

export const subscribeBlogSettings = settingsDoc.subscribe;

export function saveBlogSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heroHeadline: cleanText(payload.heroHeadline),
    heroSubcopy: cleanText(payload.heroSubcopy),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
  });
}

// ---------------------------------------------------------------------------
// Image upload — article cover
// ---------------------------------------------------------------------------
const imageUploader = createImageUploader({ pathPrefix: "thestylelife/blog/cover" });

export const uploadArticleImage = imageUploader.upload;
