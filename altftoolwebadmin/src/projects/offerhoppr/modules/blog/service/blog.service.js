import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Offerhoppr — Blog module data layer.
 *
 * Doc `projects/offerhoppr/blog/settings` holds the list-page hero copy.
 * Collection `projects/offerhoppr/blogArticles` holds the articles. `category`
 * and `author` are plain free-text strings (NOT references to separate
 * categories/team collections) — the frontend derives its category filter
 * dynamically from whatever distinct category strings exist across posts.
 */

const PROJECT_ID = "offerhoppr";
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  heroHeadline: "The Offerhoppr Blog",
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

function normalizeArticle(payload) {
  const image = payload.image || payload.imageUrl || "";
  return {
    slug: String(payload.slug || "").trim().toLowerCase(),
    title: String(payload.title || "").trim(),
    // Frontend reads `imageUrl` (also accepts `image`); store both for safety.
    image,
    imageUrl: image,
    imagePath: payload.imagePath || "",
    category: String(payload.category || "").trim(),
    excerpt: String(payload.excerpt || "").trim(),
    author: String(payload.author || "").trim(),
    date: String(payload.date || "").trim(),
    readTime: String(payload.readTime || "").trim(),
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
