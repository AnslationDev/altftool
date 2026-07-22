import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Offerris — Blog module data layer.
 *
 * Doc `projects/offerris/blog/settings` holds the `/blog` list-page hero
 * copy (badge + headline + subcopy, matching `data/pages.json.blog`).
 * Collection `projects/offerris/blogArticles` holds the articles, matching
 * `data/blogs.json` — `author` is a team member slug string, `readingTime`
 * is a display string, `coverGradient` is a tailwind gradient class string,
 * and `content` is a string[] of paragraphs.
 */

const PROJECT_ID = "offerris";
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  badge: "The Journal",
  heroHeadline: "Straight talk on design, growth, and code.",
  heroSubcopy: "No gated ebooks, no filler. Just what we're actually seeing across client work.",
};

/**
 * `content` is stored as string[] — one entry per paragraph. Accepts either
 * an array or a single textarea string where BLANK-LINE-separated blocks
 * become paragraphs (split on /\n\s*\n/).
 */
function cleanParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** Accepts a string[] or a newline-joined string. */
function cleanTags(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeArticle(payload) {
  return {
    slug: String(payload.slug || "").trim().toLowerCase(),
    title: String(payload.title || "").trim(),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    excerpt: String(payload.excerpt || "").trim(),
    category: String(payload.category || "").trim(),
    author: String(payload.author || "").trim(),
    date: String(payload.date || "").trim(),
    readingTime: String(payload.readingTime || "").trim(),
    tags: cleanTags(payload.tags),
    coverGradient: String(payload.coverGradient || "").trim(),
    content: cleanParagraphs(payload.content),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settings = createSingletonDocService(SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);
const articles = createCollectionCrudService(ARTICLES_PATH, { normalize: normalizeArticle });
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/cover` });

export const subscribeBlogSettings = settings.subscribe;
export const saveBlogSettings = settings.save;

export const subscribeArticles = articles.subscribe;
export const createArticle = articles.create;
export const updateArticle = articles.update;
export const deleteArticle = articles.remove;
export const toggleArticleStatus = articles.toggleActive;

export const uploadBlogImage = cover.upload;
export const deleteBlogImage = cover.remove;
