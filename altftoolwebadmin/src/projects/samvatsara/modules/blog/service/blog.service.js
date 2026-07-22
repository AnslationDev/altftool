import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "samvatsara";
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  badge: "The studio journal",
  headingLead: "Notes on craft,",
  headingItalic: "out loud.",
  subcopy:
    "Thoughts on design, marketing, and building a small studio well — written by the people actually doing the work, not a content mill.",
  seoTitle: "Blog",
  seoDescription:
    "Field notes on design, marketing, and running a small studio well — from the team at Aurelia Studio.",
};

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** `content` is stored as string[] — one entry per paragraph (blank-line separated). */
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
    excerpt: String(payload.excerpt || "").trim(),
    content: cleanParagraphs(payload.content),
    category: String(payload.category || "").trim(),
    author: String(payload.author || "").trim(),
    date: String(payload.date || "").trim(),
    readingTime: String(payload.readingTime || "").trim(),
    tags: cleanLines(payload.tags),
    coverGradient: String(payload.coverGradient || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settings = createSingletonDocService(SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);
const articles = createCollectionCrudService(ARTICLES_PATH, { normalize: normalizeArticle });
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/article`, maxSizeMB: 8 });

export const subscribeBlogSettings = settings.subscribe;
export const saveBlogSettings = settings.save;

export const subscribeArticles = articles.subscribe;
export const createArticle = articles.create;
export const updateArticle = articles.update;
export const deleteArticle = articles.remove;
export const toggleArticleStatus = articles.toggleActive;

export const uploadBlogCover = cover.upload;
export const deleteBlogCover = cover.remove;
