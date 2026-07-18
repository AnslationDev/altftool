import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Infodrif — Blog.
 *
 * Firestore layout (merged over src/data/blog.json by the public site — field
 * names must match that file exactly):
 *
 *   projects/infodrif/blog/settings   -> blog.settings (list page copy, flat)
 *   projects/infodrif/blog/detail     -> blog.detail.settings (article chrome, flat)
 *   projects/infodrif/blogCategories  -> blog.categories[]
 *   projects/infodrif/blogArticles    -> blog.articles[]
 */

const PROJECT_ID = "infodrif";
const BLOG_SETTINGS_PATH = ["projects", PROJECT_ID, "blog", "settings"];
const BLOG_DETAIL_PATH = ["projects", PROJECT_ID, "blog", "detail"];
const BLOG_CATEGORIES_PATH = ["projects", PROJECT_ID, "blogCategories"];
const BLOG_ARTICLES_PATH = ["projects", PROJECT_ID, "blogArticles"];

export const DEFAULT_BLOG_SETTINGS = {
  heading: "Blog & articles",
  listHeading: "Blog and articles",
  listSubheading: "Latest insights and trends",
  readMoreLabel: "Read more",
  defaultTag: "News",
  defaultImageUrl: "",
  defaultImagePath: "",
};

export const DEFAULT_BLOG_DETAIL_SETTINGS = {
  authorHeading: "Author",
  dateHeading: "Date",
  tableOfContentsHeading: "Table of contents",
  shareHeading: "Share",
  getStartedLabel: "Get started",
  whatsNextHeading: "What's Next?",
  relatedArticlesHeading: "Related Articles",
  imageOverlayTitle: "",
  imageOverlaySubtitle: "",
};

export const EMPTY_BLOG_CATEGORY = {
  title: "",
  order: 0,
  active: true,
};

/** The block types the public article renderer understands. */
export const CONTENT_BLOCK_TYPES = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "image",
  "code",
];

export const CONTENT_BLOCK_LABELS = {
  paragraph: "Paragraph",
  heading: "Heading",
  list: "List",
  quote: "Quote",
  image: "Image",
  code: "Code",
};

export function createEmptyBlock(type = "paragraph") {
  switch (type) {
    case "list":
      return { type: "list", items: [""] };
    case "image":
      return { type: "image", imageUrl: "", imagePath: "", caption: "" };
    case "code":
      return { type: "code", language: "", code: "" };
    case "quote":
      return { type: "quote", text: "", author: "" };
    case "heading":
      return { type: "heading", text: "" };
    case "paragraph":
    default:
      return { type: "paragraph", text: "" };
  }
}

export const EMPTY_ARTICLE = {
  slug: "",
  title: "",
  excerpt: "",
  category: "",
  tag: "",
  date: "",
  readTime: "",
  imageUrl: "",
  imagePath: "",
  heroImageUrl: "",
  heroImagePath: "",
  author: { name: "", role: "", avatarUrl: "", avatarPath: "" },
  tags: [],
  tableOfContents: [],
  content: [],
  whatsNext: { content: [] },
  relatedArticles: [],
  seoTitle: "",
  seoDescription: "",
  order: 0,
  active: true,
};

/* ── Normalizers ──────────────────────────────────────────────────────── */

const cleanText = (value = "") => String(value).trim();

const cleanList = (value) =>
  (Array.isArray(value) ? value : []).map((entry) => cleanText(entry)).filter(Boolean);

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Shapes one content block to exactly the keys its `type` carries on the site.
 * Anything else is dropped so a block that changed type doesn't leave orphan
 * fields behind on the document.
 */
function normalizeBlock(block) {
  const type = CONTENT_BLOCK_TYPES.includes(block?.type) ? block.type : "paragraph";
  switch (type) {
    case "list":
      return { type, items: cleanList(block.items) };
    case "image":
      return {
        type,
        imageUrl: block.imageUrl || "",
        imagePath: block.imagePath || "",
        caption: cleanText(block.caption),
      };
    case "code":
      return {
        type,
        language: cleanText(block.language),
        code: String(block.code ?? ""),
      };
    case "quote":
      return { type, text: cleanText(block.text), author: cleanText(block.author) };
    case "heading":
      return { type, text: cleanText(block.text) };
    case "paragraph":
    default:
      return { type, text: cleanText(block.text) };
  }
}

function blockHasContent(block) {
  switch (block.type) {
    case "list":
      return block.items.length > 0;
    case "image":
      return Boolean(block.imageUrl);
    case "code":
      return Boolean(block.code.trim());
    default:
      return Boolean(block.text);
  }
}

function normalizeBlocks(content) {
  return (Array.isArray(content) ? content : []).map(normalizeBlock).filter(blockHasContent);
}

function normalizeAuthor(author) {
  return {
    name: cleanText(author?.name),
    role: cleanText(author?.role),
    avatarUrl: author?.avatarUrl || "",
    avatarPath: author?.avatarPath || "",
  };
}

function normalizeTableOfContents(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry, index) => ({
      title: cleanText(entry?.title),
      anchor: cleanText(entry?.anchor),
      order: Number(entry?.order ?? index) || 0,
    }))
    .filter((entry) => entry.title);
}

function normalizeRelatedArticles(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry, index) => ({
      title: cleanText(entry?.title),
      slug: cleanText(entry?.slug),
      date: cleanText(entry?.date),
      category: cleanText(entry?.category),
      imageUrl: entry?.imageUrl || "",
      imagePath: entry?.imagePath || "",
      order: Number(entry?.order ?? index) || 0,
    }))
    .filter((entry) => entry.title);
}

function normalizeArticle(payload) {
  const title = cleanText(payload.title);
  const excerpt = cleanText(payload.excerpt);
  return {
    slug: createSlug(payload.slug || title),
    title,
    excerpt,
    category: cleanText(payload.category),
    tag: cleanText(payload.tag),
    date: cleanText(payload.date),
    readTime: cleanText(payload.readTime),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    heroImageUrl: payload.heroImageUrl || "",
    heroImagePath: payload.heroImagePath || "",
    author: normalizeAuthor(payload.author),
    tags: cleanList(payload.tags),
    tableOfContents: normalizeTableOfContents(payload.tableOfContents),
    content: normalizeBlocks(payload.content),
    whatsNext: { content: normalizeBlocks(payload.whatsNext?.content) },
    relatedArticles: normalizeRelatedArticles(payload.relatedArticles),
    seoTitle: cleanText(payload.seoTitle) || title,
    seoDescription: cleanText(payload.seoDescription) || excerpt,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeCategory(payload) {
  return {
    title: cleanText(payload.title),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

/* ── Services (composed from the shared factories) ────────────────────── */

const settingsService = createSingletonDocService(BLOG_SETTINGS_PATH, DEFAULT_BLOG_SETTINGS);
const detailService = createSingletonDocService(BLOG_DETAIL_PATH, DEFAULT_BLOG_DETAIL_SETTINGS);
const categoriesService = createCollectionCrudService(BLOG_CATEGORIES_PATH, {
  normalize: normalizeCategory,
  orderByField: "order",
});
const articlesService = createCollectionCrudService(BLOG_ARTICLES_PATH, {
  normalize: normalizeArticle,
  orderByField: "order",
});

const articleImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/article` });
const heroImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/hero` });
const authorAvatarUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/author` });
const blockImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/blog/block` });

/**
 * One-document read for the edit route. Subscribing to the whole collection to
 * find a single article costs one read per article on every snapshot; the edit
 * form only needs a starting value, so fetch just that document.
 */
export async function getBlogArticle(id) {
  const snapshot = await getDoc(doc(db, ...BLOG_ARTICLES_PATH, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export const subscribeBlogSettings = settingsService.subscribe;
export const saveBlogSettings = settingsService.save;
export const resetBlogSettings = settingsService.reset;

export const subscribeBlogDetailSettings = detailService.subscribe;
export const saveBlogDetailSettings = detailService.save;
export const resetBlogDetailSettings = detailService.reset;

export const subscribeBlogCategories = categoriesService.subscribe;
export const createBlogCategory = categoriesService.create;
export const updateBlogCategory = categoriesService.update;
export const deleteBlogCategory = categoriesService.remove;
export const toggleBlogCategoryStatus = categoriesService.toggleActive;

export const subscribeBlogArticles = articlesService.subscribe;
export const createBlogArticle = articlesService.create;
export const updateBlogArticle = articlesService.update;
export const deleteBlogArticle = articlesService.remove;
export const toggleBlogArticleStatus = articlesService.toggleActive;

export const uploadBlogArticleImage = articleImageUploader.upload;
export const deleteBlogArticleImage = articleImageUploader.remove;
export const uploadBlogHeroImage = heroImageUploader.upload;
export const deleteBlogHeroImage = heroImageUploader.remove;
export const uploadBlogAuthorAvatar = authorAvatarUploader.upload;
export const deleteBlogAuthorAvatar = authorAvatarUploader.remove;
export const uploadBlogBlockImage = blockImageUploader.upload;
export const deleteBlogBlockImage = blockImageUploader.remove;
