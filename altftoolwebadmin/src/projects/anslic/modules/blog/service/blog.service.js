import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

const PROJECT_ID = "anslic";
const BLOG_SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const BLOG_ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  eyebrow: "Insights",
  title: "From the Blog",
  subtitle: "Playbooks and perspectives from the Anslic team.",
  seoTitle: "",
  seoDescription: "",
};

export const EMPTY_ARTICLE = {
  slug: "",
  title: "",
  category: "",
  author: "",
  date: "",
  imageUrl: "",
  imagePath: "",
  excerpt: "",
  content: [""],
  seoTitle: "",
  seoDescription: "",
  order: 0,
  active: true,
};

const cleanText = (value = "") => String(value).trim();

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeContent(content) {
  if (Array.isArray(content)) {
    return content.map((paragraph) => cleanText(paragraph)).filter(Boolean);
  }
  const text = cleanText(content);
  return text ? [text] : [];
}

function normalizeArticle(payload) {
  const title = cleanText(payload.title);
  return {
    slug: createSlug(payload.slug || title),
    title,
    category: cleanText(payload.category),
    author: cleanText(payload.author),
    date: cleanText(payload.date),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    excerpt: cleanText(payload.excerpt),
    content: normalizeContent(payload.content),
    seoTitle: cleanText(payload.seoTitle || title),
    seoDescription: cleanText(payload.seoDescription || payload.excerpt),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(BLOG_SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);
const articlesService = createCollectionCrudService(BLOG_ARTICLES_PATH, {
  normalize: normalizeArticle,
  orderByField: "date",
});
const articleImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/article` });

export const subscribeBlogSettings = settingsService.subscribe;
export const saveBlogSettings = settingsService.save;

export const subscribeBlogArticles = articlesService.subscribe;
export const createBlogArticle = articlesService.create;
export const updateBlogArticle = articlesService.update;
export const deleteBlogArticle = articlesService.remove;
export const toggleBlogArticleStatus = articlesService.toggleActive;

export const uploadBlogArticleImage = articleImageUploader.upload;
export const deleteBlogArticleImage = articleImageUploader.remove;
