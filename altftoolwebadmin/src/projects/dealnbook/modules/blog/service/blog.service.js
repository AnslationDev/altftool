import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Dealnbook — Blog module data layer.
 *
 * Doc `projects/dealnbook/blog/settings` holds the list-page hero copy.
 * Collection `projects/dealnbook/blogArticles` holds the articles. `category`
 * and `author` are plain free-text strings — the frontend derives its
 * category filter dynamically from whatever distinct category strings exist
 * across posts.
 */

const PROJECT_ID = "dealnbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  heroHeadline: "The Dealnbook Blog",
  heroSubcopy: "Deal-hunting tips, savings guides, and the latest offers — straight from the team.",
};

/** `content` is stored as string[] — one entry per paragraph. */
function cleanParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

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
    category: String(payload.category || "").trim(),
    excerpt: String(payload.excerpt || "").trim(),
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
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/cover`, maxSizeMB: 8 });

export const subscribeBlogSettings = settings.subscribe;
export const saveBlogSettings = settings.save;

export const subscribeArticles = articles.subscribe;
export const createArticle = articles.create;
export const updateArticle = articles.update;
export const deleteArticle = articles.remove;
export const toggleArticleStatus = articles.toggleActive;

export const uploadBlogCover = cover.upload;
export const deleteBlogCover = cover.remove;
