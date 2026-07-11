"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "coozter";
const BLOG_PAGE_DOC_PATH = ["projects", PROJECT_ID, "blog", "blogPageContent"];
const BLOGS_COLLECTION_PATH = ["projects", PROJECT_ID, "blogs"];

export const DEFAULT_BLOG_PAGE_CONTENT = {
  heroSection: {
    isActive: true,
    eyebrowText: "Coozter Field Notes",
    headingText: "Clear thinking on partners, search, campaigns, and brand trust.",
    descriptionText:
      "Practical notes from the work behind affiliate branding, performance marketing, search visibility, and useful reporting.",
    featuredBadgeText: "Featured",
    insightLabel: "Field insight",
    notesLabel: "notes",
  },
  articleListSection: {
    isActive: true,
    eyebrowText: "All articles",
    headingText: "Latest thinking from the field.",
    articleFoundSingularText: "article found",
    articleFoundPluralText: "articles found",
    emptyMoreArticlesText: "No more articles match this filter yet.",
    emptyTitle: "No articles found",
    emptyDescription: "Try another keyword or category.",
  },
  buttons: {
    featuredButtonLabel: "Read article",
    cardButtonLabel: "Read article",
    previewButtonLabel: "Read",
    backButtonLabel: "Back to articles",
    allArticlesLabel: "All articles",
  },
  detailPage: {
    fieldNoteBadgeText: "Field note",
    contentsTitle: "Contents",
    contents: [
      { label: "Opening", targetId: "opening", sortOrder: 1, isActive: true },
      { label: "What changes", targetId: "what-changes", sortOrder: 2, isActive: true },
      { label: "Practical read", targetId: "practical-read", sortOrder: 3, isActive: true },
      { label: "Related", targetId: "related", sortOrder: 4, isActive: true },
    ],
    defaultExtraParagraph:
      "In practice, this means naming the decision you want the asset or campaign to support. If the answer is vague, the work will drift. If the answer is clear, the channel has something useful to do.",
    sideCardOne: {
      iconKey: "trending-up",
      eyebrowText: "Useful when",
      descriptionText: "Your team needs clearer decisions from content, partners, or performance channels.",
    },
    sideCardTwo: {
      iconKey: "layers",
      eyebrowText: "Article type",
      descriptionText: "Strategy note for teams building visibility, partner trust, and measurable demand.",
    },
    ctaSection: {
      headingText: "Bring this thinking into your growth plan.",
      descriptionText: "We can help translate the ideas into search pages, partner assets, campaigns, and reporting.",
      buttonLabel: "Plan My Growth",
      buttonUrl: "/contact",
    },
    relatedSection: {
      eyebrowText: "Continue reading",
      headingText: "Related articles",
      allArticlesLabel: "All articles",
      allArticlesUrl: "/blogs",
    },
    newsletterSection: {
      headingText: "Newsletter",
      descriptionText: "Get one practical note each month on affiliate branding, search, performance, and reporting.",
      placeholderText: "work@email.com",
      submitAriaLabel: "Subscribe",
      validationErrorText: "Use a valid work email.",
      successText: "You are on the list.",
    },
  },
};

export const EMPTY_BLOG_POST = {
  slug: "",
  title: "",
  category: "",
  author: "Coozter Team",
  excerpt: "",
  description: "",
  imageUrl: "",
  imageAlt: "",
  image: "",
  readTime: "",
  displayDate: "",
  date: "",
  body: [],
  pullQuote: "",
  status: "draft",
  published: false,
  order: 1,
  seo: {
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
  },
};

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function subscribeBlogPageContent(onNext, onError) {
  return onSnapshot(
    doc(db, ...BLOG_PAGE_DOC_PATH),
    (snap) => onNext(normalizeBlogPageContent(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveBlogPageContent(payload) {
  await setDoc(doc(db, ...BLOG_PAGE_DOC_PATH), {
    ...normalizeBlogPageContent(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function seedBlogPageContent() {
  await setDoc(doc(db, ...BLOG_PAGE_DOC_PATH), {
    ...normalizeBlogPageContent(DEFAULT_BLOG_PAGE_CONTENT),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeBlogPosts(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...BLOGS_COLLECTION_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function fetchBlogPost(id) {
  const snap = await getDoc(doc(db, ...BLOGS_COLLECTION_PATH, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createBlogPost(payload) {
  const post = normalizeBlogPost(payload);
  await addDoc(collection(db, ...BLOGS_COLLECTION_PATH), {
    ...post,
    publishedAt: post.published ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBlogPost(id, payload) {
  const post = normalizeBlogPost(payload);
  await updateDoc(doc(db, ...BLOGS_COLLECTION_PATH, id), {
    ...post,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogPost(id) {
  await deleteDoc(doc(db, ...BLOGS_COLLECTION_PATH, id));
}

export async function toggleBlogPostStatus(id, publish) {
  await updateDoc(doc(db, ...BLOGS_COLLECTION_PATH, id), {
    status: publish ? "published" : "draft",
    published: publish,
    updatedAt: serverTimestamp(),
    ...(publish ? { publishedAt: serverTimestamp() } : {}),
  });
}

export function uploadBlogImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/blogs/blog-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve({ url: await getDownloadURL(task.snapshot.ref), path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export function normalizeBlogPageContent(content = {}) {
  const merged = {
    ...DEFAULT_BLOG_PAGE_CONTENT,
    ...content,
    heroSection: { ...DEFAULT_BLOG_PAGE_CONTENT.heroSection, ...(content.heroSection || {}) },
    articleListSection: { ...DEFAULT_BLOG_PAGE_CONTENT.articleListSection, ...(content.articleListSection || {}) },
    buttons: { ...DEFAULT_BLOG_PAGE_CONTENT.buttons, ...(content.buttons || {}) },
    detailPage: {
      ...DEFAULT_BLOG_PAGE_CONTENT.detailPage,
      ...(content.detailPage || {}),
      sideCardOne: { ...DEFAULT_BLOG_PAGE_CONTENT.detailPage.sideCardOne, ...(content.detailPage?.sideCardOne || {}) },
      sideCardTwo: { ...DEFAULT_BLOG_PAGE_CONTENT.detailPage.sideCardTwo, ...(content.detailPage?.sideCardTwo || {}) },
      ctaSection: { ...DEFAULT_BLOG_PAGE_CONTENT.detailPage.ctaSection, ...(content.detailPage?.ctaSection || {}) },
      relatedSection: { ...DEFAULT_BLOG_PAGE_CONTENT.detailPage.relatedSection, ...(content.detailPage?.relatedSection || {}) },
      newsletterSection: { ...DEFAULT_BLOG_PAGE_CONTENT.detailPage.newsletterSection, ...(content.detailPage?.newsletterSection || {}) },
    },
  };

  return {
    heroSection: normalizeObject(merged.heroSection, ["eyebrowText", "headingText", "descriptionText", "featuredBadgeText", "insightLabel", "notesLabel"]),
    articleListSection: normalizeObject(merged.articleListSection, ["eyebrowText", "headingText", "articleFoundSingularText", "articleFoundPluralText", "emptyMoreArticlesText", "emptyTitle", "emptyDescription"]),
    buttons: normalizeObject(merged.buttons, ["featuredButtonLabel", "cardButtonLabel", "previewButtonLabel", "backButtonLabel", "allArticlesLabel"], false),
    detailPage: {
      fieldNoteBadgeText: clean(merged.detailPage.fieldNoteBadgeText),
      contentsTitle: clean(merged.detailPage.contentsTitle),
      contents: normalizeRows(merged.detailPage.contents, ["label", "targetId"]),
      defaultExtraParagraph: clean(merged.detailPage.defaultExtraParagraph),
      sideCardOne: normalizeObject(merged.detailPage.sideCardOne, ["iconKey", "eyebrowText", "descriptionText"], false),
      sideCardTwo: normalizeObject(merged.detailPage.sideCardTwo, ["iconKey", "eyebrowText", "descriptionText"], false),
      ctaSection: normalizeObject(merged.detailPage.ctaSection, ["headingText", "descriptionText", "buttonLabel", "buttonUrl"], false),
      relatedSection: normalizeObject(merged.detailPage.relatedSection, ["eyebrowText", "headingText", "allArticlesLabel", "allArticlesUrl"], false),
      newsletterSection: normalizeObject(merged.detailPage.newsletterSection, ["headingText", "descriptionText", "placeholderText", "submitAriaLabel", "validationErrorText", "successText"], false),
    },
  };
}

export function normalizeBlogPost(payload = {}) {
  const title = clean(payload.title);
  const slug = createSlug(payload.slug || title);
  const status = payload.status === "published" || payload.published === true ? "published" : "draft";
  return {
    slug,
    title,
    category: clean(payload.category),
    author: clean(payload.author),
    excerpt: clean(payload.excerpt),
    description: clean(payload.description),
    imageUrl: clean(payload.imageUrl),
    imageAlt: clean(payload.imageAlt),
    image: clean(payload.image),
    readTime: clean(payload.readTime),
    displayDate: clean(payload.displayDate),
    date: clean(payload.date),
    body: normalizeList(payload.body),
    pullQuote: clean(payload.pullQuote),
    status,
    published: status === "published",
    order: toOrder(payload.order, 0),
    seo: {
      metaTitle: clean(payload.seo?.metaTitle || payload.metaTitle),
      metaDescription: clean(payload.seo?.metaDescription || payload.metaDescription),
      canonicalUrl: clean(payload.seo?.canonicalUrl || payload.canonicalUrl),
    },
  };
}

function normalizeObject(source, fields, withActive = true) {
  return Object.fromEntries([
    ...(withActive ? [["isActive", source?.isActive !== false]] : []),
    ...fields.map((field) => [field, clean(source?.[field])]),
  ]);
}

function normalizeRows(rows, fields) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({
      ...Object.fromEntries(fields.map((field) => [field, clean(row?.[field])])),
      sortOrder: toOrder(row?.sortOrder, index),
      isActive: row?.isActive !== false,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return String(value || "").split(/\r?\n/).map(clean).filter(Boolean);
}

function clean(value) {
  return String(value ?? "").trim();
}

function toOrder(value, index) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : index + 1;
}
