import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Snapagee — Blog module data layer.
 *
 * Collection CRUD at `projects/snapagee/blogArticles` plus a `blog/settings`
 * singleton for the `/blog` page header and the detail page's related strip
 * (see CONTRACT.md — field names are authoritative). Article `content` is an
 * array of paragraph strings, edited as one blank-line-separated textarea in
 * the admin — identical pattern to TheStyleLife's blog module (`toParagraphs`
 * / `paragraphsToText`), PROJECT_ID + field-name changes only.
 *
 * NOTE: unlike other tenants, Snapagee's `blogArticles` has NO `relatedSlugs`
 * field — related posts are computed by category match in the frontend
 * component, not admin-curated.
 *
 * The collection starts empty on purpose — the frontend's JSON fallback
 * (`data/blogs.json`) already has all 6 real posts; only new/edited posts
 * need to be written here.
 */

const PROJECT_ID = "snapagee";
const ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];
const SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];

const cleanText = (value = "") => String(value ?? "").trim();

/** Local slug helper — snapagee has no services module yet to import this from. */
export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Blank-line-separated textarea <-> paragraphs array. */
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
    image: cleanText(payload.image),
    excerpt: cleanText(payload.excerpt),
    category: cleanText(payload.category),
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
// /blog page header + related strip — doc blog/settings
// ---------------------------------------------------------------------------
export const DEFAULT_BLOG_SETTINGS = {
  pageEyebrow: "The Blog",
  pageHeading: "Sharp thinking, no fluff",
  pageDescription:
    "Field notes on growth, design, and engineering from the team shipping the work.",
  relatedEyebrow: "Keep Reading",
  relatedHeading: "More from the blog",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);

export const subscribeBlogSettings = settingsDoc.subscribe;

export function saveBlogSettings(payload) {
  return settingsDoc.save({
    pageEyebrow: cleanText(payload.pageEyebrow),
    pageHeading: cleanText(payload.pageHeading),
    pageDescription: cleanText(payload.pageDescription),
    relatedEyebrow: cleanText(payload.relatedEyebrow),
    relatedHeading: cleanText(payload.relatedHeading),
  });
}

// ---------------------------------------------------------------------------
// Image upload — article cover, namespaced per article slug
// (pathPrefix: "snapagee/blog/<slug>", per CONTRACT.md)
// ---------------------------------------------------------------------------
export function createArticleImageUploader(slug) {
  return createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/${createSlug(slug) || "draft"}` }).upload;
}
