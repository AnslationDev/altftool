"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { SMARTLUCKY_PROJECT_ROOT, SMARTLUCKY_BLOGS_COLLECTION } from "@altftool/core/firebasePaths";

const blogsCol = collection(db, ...SMARTLUCKY_BLOGS_COLLECTION);

function blogDocRef(id) {
  return doc(db, ...SMARTLUCKY_BLOGS_COLLECTION, id);
}

function slugify(text) {
  return (text || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-");
}

function withSlugLower(payload = {}) {
  return payload.slug ? { ...payload, slugLower: slugify(payload.slug) } : payload;
}

export async function fetchBlogById(id) {
  const snap = await getDoc(blogDocRef(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchAllBlogs() {
  const snap = await getDocs(blogsCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

let _allBlogsCache = null;
let _allBlogsPromise = null;

export function invalidateBlogsCache() {
  _allBlogsCache = null;
  _allBlogsPromise = null;
}

export async function fetchAllBlogsCached({ force = false } = {}) {
  if (!force && _allBlogsCache) return _allBlogsCache;
  if (!force && _allBlogsPromise) return _allBlogsPromise;

  _allBlogsPromise = fetchAllBlogs()
    .then((blogs) => {
      _allBlogsCache = blogs;
      _allBlogsPromise = null;
      return blogs;
    })
    .catch((err) => {
      _allBlogsPromise = null;
      throw err;
    });

  return _allBlogsPromise;
}

export async function fetchBlogBySlug(slug) {
  const lower = slugify(slug);
  if (!lower) return null;
  const q = query(blogsCol, where("slugLower", "==", lower), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function isSlugTaken(slug, currentId = "") {
  const existing = await fetchBlogBySlug(slug);
  return Boolean(existing && existing.id !== currentId);
}

export async function createBlog(payload) {
  const refDoc = doc(blogsCol);
  await setDoc(refDoc, {
    ...withSlugLower(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidateBlogsCache();
  invalidateAllBlogsCache();
  return refDoc;
}

export async function updateBlog(id, payload) {
  const cleanPayload = { ...payload };
  delete cleanPayload[MOCK_SOURCE_FLAG];

  await updateDoc(blogDocRef(id), {
    ...withSlugLower(cleanPayload),
    updatedAt: serverTimestamp(),
  });
  invalidateBlogsCache();
  invalidateAllBlogsCache();
}

export async function updateBlogImage(id, imageUrl) {
  await updateDoc(blogDocRef(id), {
    image: imageUrl,
  });
}

export async function updateBlogStatus(id, status) {
  await updateDoc(blogDocRef(id), {
    status,
    updatedAt: serverTimestamp(),
  });
  invalidateBlogsCache();
  invalidateAllBlogsCache();
}

export async function deleteBlog(id) {
  try {
    const snap = await getDoc(blogDocRef(id));
    if (snap.exists() && snap.data()[MOCK_SOURCE_FLAG] === MOCK_SOURCE_VALUE) {
      await addDeletedMockSlug(snap.data().slug);
    }
  } catch {
    // best-effort
  }
  await deleteDoc(blogDocRef(id));
  invalidateBlogsCache();
  invalidateAllBlogsCache();
}

export async function bulkDeleteBlogs(ids) {
  try {
    const snapshots = await Promise.allSettled(ids.map((id) => getDoc(blogDocRef(id))));
    for (const result of snapshots) {
      if (result.status === "fulfilled" && result.value.exists() && result.value.data()[MOCK_SOURCE_FLAG] === MOCK_SOURCE_VALUE) {
        await addDeletedMockSlug(result.value.data().slug);
      }
    }
  } catch {
    // best-effort
  }
  await Promise.all(ids.map((id) => deleteDoc(blogDocRef(id))));
  invalidateBlogsCache();
  invalidateAllBlogsCache();
}

/* ── Mock data seeding ── */

export const MOCK_SOURCE_FLAG = "_source";
export const MOCK_SOURCE_VALUE = "mock";

const BLOG_CONFIG_COLLECTION = "_blogConfig";
const DELETED_MOCK_SLUGS_DOC = "deletedMockSlugs";

function mockDataRef() {
  return doc(db, ...SMARTLUCKY_PROJECT_ROOT, BLOG_CONFIG_COLLECTION, DELETED_MOCK_SLUGS_DOC);
}

export async function getDeletedMockSlugs() {
  try {
    const snap = await getDoc(mockDataRef());
    const slugs = snap.exists() ? snap.data().slugs : [];
    return Array.isArray(slugs) ? new Set(slugs) : new Set();
  } catch {
    return new Set();
  }
}

export async function addDeletedMockSlug(slug) {
  try {
    const ref = mockDataRef();
    const snap = await getDoc(ref);
    const current = snap.exists() ? (snap.data().slugs || []) : [];
    if (!current.includes(slug)) {
      current.push(slug);
      await setDoc(ref, { slugs: current }, { merge: true });
    }
  } catch (err) {
    console.warn("Failed to track deleted mock slug:", err);
  }
}

export async function seedMockBlogsToFirebase() {
  const { default: MOCK_BLOGS } = await import("../data/mockBlogsSeed");
  const deletedSlugs = await getDeletedMockSlugs();

  let existingSlugs = new Set();
  try {
    const snap = await getDocs(blogsCol);
    snap.docs.forEach((d) => existingSlugs.add(d.data().slug));
  } catch {
    for (const mock of MOCK_BLOGS) {
      try {
        const q = query(blogsCol, where("slug", "==", mock.slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) existingSlugs.add(mock.slug);
      } catch {
        // skip
      }
    }
  }

  const toSeed = MOCK_BLOGS.filter(
    (mock) => !existingSlugs.has(mock.slug) && !deletedSlugs.has(mock.slug)
  );

  if (toSeed.length === 0) return 0;

  const results = await Promise.allSettled(
    toSeed.map(async (mock) => {
      const refDoc = doc(blogsCol);
      await setDoc(refDoc, {
        heading: mock.title,
        title: mock.title,
        slug: mock.slug,
        slugLower: slugify(mock.slug),
        category: mock.category,
        author: "Smart Lucky Editorial",
        excerpt: mock.excerpt,
        description: mock.content,
        content: mock.content,
        date: mock.date,
        image: mock.image,
        imageAlt: `${mock.title} cover image`,
        tags: [mock.category].filter(Boolean),
        status: "published",
        views: 0,
        likesCount: 0,
        commentsCount: 0,
        sources: [],
        sourceNotes: "",
        [MOCK_SOURCE_FLAG]: MOCK_SOURCE_VALUE,
        createdAt: new Date(mock.date),
        updatedAt: new Date(mock.date),
      });
    })
  );

  const seeded = results.filter((r) => r.status === "fulfilled").length;
  if (seeded > 0) invalidateBlogsCache();
  return seeded;
}

/* ── Fetch all blogs including seeded mock data ── */
let _allBlogsWithMockCache = null;
let _allBlogsWithMockPromise = null;

export function invalidateAllBlogsCache() {
  _allBlogsWithMockCache = null;
  _allBlogsWithMockPromise = null;
}

export async function fetchAllBlogsWithMockData({ force = false } = {}) {
  if (!force && _allBlogsWithMockCache) return _allBlogsWithMockCache;
  if (!force && _allBlogsWithMockPromise) return _allBlogsWithMockPromise;

  _allBlogsWithMockPromise = (async () => {
    await seedMockBlogsToFirebase();
    const blogs = await fetchAllBlogs();
    _allBlogsWithMockCache = blogs;
    _allBlogsWithMockPromise = null;
    return blogs;
  })()
    .catch((err) => {
      _allBlogsWithMockPromise = null;
      throw err;
    });

  return _allBlogsWithMockPromise;
}
