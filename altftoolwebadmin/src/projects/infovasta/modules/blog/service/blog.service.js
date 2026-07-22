import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "infovasta";
// NOTE: exact collection name per the deployed infovasta firestore.rules —
// "blogArticles", not "blog".
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];
// Isolated from the `blogArticles` item collection on purpose — the deployed
// infovasta firestore.rules keep list-page hero/meta/template copy in its
// own `pages/{pageId}` doc, never inside the item collections themselves.
const PAGE_PATH = ["projects", PROJECT_ID, "pages", "blog"];

export const DEFAULT_BLOG_PAGE = {
  meta: {
    title: "",
    description: "",
  },
  hero: {
    eyebrow: "",
    title: "",
    highlight: "",
    description: "",
  },
  searchPlaceholder: "Search articles...",
  emptyText: "No articles found.",
  allLabel: "All",
  detail: {
    backLabel: "Back to Blog",
    moreHeading: "More Articles",
  },
};

const cleanText = (value = "") => String(value).trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** `body` is stored as string[] — one entry per paragraph row from the editor. */
function cleanParagraphs(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function normalizeArticle(payload) {
  return {
    slug: createSlug(payload.slug || payload.title),
    large: Boolean(payload.large),
    image: cleanText(payload.image),
    imagePath: cleanText(payload.imagePath),
    width: Number(payload.width) || 0,
    height: Number(payload.height) || 0,
    tag: cleanText(payload.tag),
    category: cleanText(payload.category),
    tags: cleanLines(payload.tags),
    author: cleanText(payload.author),
    readingTime: cleanText(payload.readingTime),
    date: cleanText(payload.date),
    title: cleanText(payload.title),
    excerpt: cleanText(payload.excerpt),
    body: cleanParagraphs(payload.body),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const articles = createCollectionCrudService(ARTICLES_PATH, { normalize: normalizeArticle });
const blogPage = createSingletonDocService(PAGE_PATH, DEFAULT_BLOG_PAGE);
const cover = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/cover`, maxSizeMB: 8 });

export const subscribeArticles = articles.subscribe;
export const createArticle = articles.create;
export const updateArticle = articles.update;
export const deleteArticle = articles.remove;
export const toggleArticleStatus = articles.toggleActive;

export const subscribeBlogPage = blogPage.subscribe;
export const saveBlogPage = blogPage.save;

export const uploadBlogCover = cover.upload;
export const deleteBlogCover = cover.remove;

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
