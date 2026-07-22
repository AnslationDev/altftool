import { createCollectionCrudService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "dailyhnt";
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];
const CATEGORIES_PATH = ["projects", PROJECT_ID, "blogCategories"];

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
    tags: cleanLines(payload.tags),
    content: cleanParagraphs(payload.content),
    relatedSlugs: cleanLines(payload.relatedSlugs),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeCategory(payload) {
  return {
    name: String(payload.name || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const articles = createCollectionCrudService(ARTICLES_PATH, { normalize: normalizeArticle });
const categories = createCollectionCrudService(CATEGORIES_PATH, { normalize: normalizeCategory });
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/cover`, maxSizeMB: 8 });

export const subscribeArticles = articles.subscribe;
export const createArticle = articles.create;
export const updateArticle = articles.update;
export const deleteArticle = articles.remove;
export const toggleArticleStatus = articles.toggleActive;

export const subscribeCategories = categories.subscribe;
export const createCategory = categories.create;
export const deleteCategory = categories.remove;

export const uploadBlogCover = cover.upload;
export const deleteBlogCover = cover.remove;
