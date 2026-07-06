import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "carrerbook";
const CATEGORY_COLLECTION = "blog-category";
const ARTICLE_COLLECTION = "blog-articles";
const LEGACY_CATEGORY_COLLECTION = "blogCategories";
const LEGACY_ARTICLE_COLLECTION = "blogArticles";
const CATEGORY_COLLECTIONS = [CATEGORY_COLLECTION, LEGACY_CATEGORY_COLLECTION];
const ARTICLE_COLLECTIONS = [ARTICLE_COLLECTION, LEGACY_ARTICLE_COLLECTION];

const collectionPath = (collectionName) => ["projects", PROJECT_ID, collectionName];
const categoryPath = (collectionName = CATEGORY_COLLECTION) => collectionPath(collectionName);
const articlePath = (collectionName = ARTICLE_COLLECTION) => collectionPath(collectionName);

export const EMPTY_ARTICLE = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  date: "",
  categoryId: "",
  categoryName: "",
  seoTitle: "",
  seoDescription: "",
  imageUrl: "",
  imagePath: "",
  imageAlt: "",
  status: "draft",
  active: true,
  likes: 0,
  commentsCount: 0,
  order: 0,
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

export function subscribeBlogCategories(onNext, onError) {
  return subscribeMergedCollections(CATEGORY_COLLECTIONS, sortCategories, onNext, onError);
}

export function subscribeBlogArticles(onNext, onError) {
  return subscribeMergedCollections(ARTICLE_COLLECTIONS, sortArticles, onNext, onError);
}

export function subscribeArticlesByCategory(categoryId, onNext, onError) {
  return subscribeMergedCollections(
    ARTICLE_COLLECTIONS,
    sortArticles,
    onNext,
    onError,
    (collectionName) => query(collection(db, ...articlePath(collectionName)), where("categoryId", "==", categoryId)),
  );
}

export async function fetchBlogArticle(id) {
  for (const collectionName of ARTICLE_COLLECTIONS) {
    const snap = await getDoc(doc(db, ...articlePath(collectionName), id));
    if (snap.exists()) return withCollection(snap, collectionName);
  }
  return null;
}

export async function createBlogCategory(payload) {
  await addDoc(collection(db, ...categoryPath()), {
    ...normalizeCategory(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBlogCategory(id, payload) {
  const normalized = normalizeCategory(payload);
  const collectionName = payload._collection || CATEGORY_COLLECTION;
  const batch = writeBatch(db);
  batch.update(doc(db, ...categoryPath(collectionName), id), {
    ...normalized,
    updatedAt: serverTimestamp(),
  });

  if (payload.previousName && payload.previousName !== normalized.name) {
    await Promise.all(ARTICLE_COLLECTIONS.map(async (articleCollectionName) => {
      const articleSnap = await getDocs(query(collection(db, ...articlePath(articleCollectionName)), where("categoryId", "==", id)));
      articleSnap.docs.forEach((item) => {
        batch.update(doc(db, ...articlePath(articleCollectionName), item.id), {
          categoryName: normalized.name,
          updatedAt: serverTimestamp(),
        });
      });
    }));
  }

  await batch.commit();
}

export async function deleteBlogCategory(id, collectionName = CATEGORY_COLLECTION) {
  const articleSnaps = await Promise.all(
    ARTICLE_COLLECTIONS.map((articleCollectionName) =>
      getDocs(query(collection(db, ...articlePath(articleCollectionName)), where("categoryId", "==", id))),
    ),
  );
  if (articleSnaps.some((snap) => !snap.empty)) {
    throw new Error("Move or delete articles in this category before deleting it.");
  }
  await deleteDoc(doc(db, ...categoryPath(collectionName), id));
}

export async function toggleBlogCategoryStatus(id, active, collectionName = CATEGORY_COLLECTION) {
  await updateDoc(doc(db, ...categoryPath(collectionName), id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export async function createBlogArticle(payload) {
  await addDoc(collection(db, ...articlePath()), {
    ...normalizeArticle(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBlogArticle(id, payload, collectionName = ARTICLE_COLLECTION) {
  await updateDoc(doc(db, ...articlePath(collectionName), id), {
    ...normalizeArticle(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogArticle(id, collectionName = ARTICLE_COLLECTION) {
  await deleteDoc(doc(db, ...articlePath(collectionName), id));
}

export async function toggleBlogArticleStatus(id, active, collectionName = ARTICLE_COLLECTION) {
  await updateDoc(doc(db, ...articlePath(collectionName), id), {
    active,
    status: active ? "published" : "draft",
    updatedAt: serverTimestamp(),
  });
}

export function uploadBlogImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/blog/article-${Date.now()}.${ext}`;
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

export async function deleteBlogImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

function normalizeCategory(payload) {
  const name = String(payload.name || "").trim();
  return {
    name,
    slug: createSlug(payload.slug || name),
    description: String(payload.description || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeArticle(payload) {
  const title = String(payload.title || "").trim();
  return {
    title,
    slug: createSlug(payload.slug || title),
    excerpt: String(payload.excerpt || "").trim(),
    content: String(payload.content || "").trim(),
    author: String(payload.author || "").trim(),
    date: String(payload.date || "").trim(),
    categoryId: String(payload.categoryId || "").trim(),
    categoryName: String(payload.categoryName || "").trim(),
    seoTitle: String(payload.seoTitle || title).trim(),
    seoDescription: String(payload.seoDescription || payload.excerpt || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    imageAlt: String(payload.imageAlt || "").trim(),
    status: payload.status === "published" ? "published" : "draft",
    active: payload.active !== false && payload.status === "published",
    likes: Number(payload.likes) || 0,
    commentsCount: Number(payload.commentsCount) || 0,
    order: Number(payload.order) || 0,
  };
}

function subscribeMergedCollections(collectionNames, sorter, onNext, onError, queryFactory) {
  const snapshots = new Map();
  const emit = () => {
    const merged = [];
    const seen = new Set();

    collectionNames.forEach((collectionName) => {
      const items = snapshots.get(collectionName) || [];
      items.forEach((item) => {
        const key = item.id;
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(item);
      });
    });

    onNext(sorter(merged));
  };

  const unsubs = collectionNames.map((collectionName) => {
    const sourceQuery = queryFactory
      ? queryFactory(collectionName)
      : query(collection(db, ...collectionPath(collectionName)));

    return onSnapshot(
      sourceQuery,
      (snap) => {
        snapshots.set(collectionName, snap.docs.map((item) => withCollection(item, collectionName)));
        emit();
      },
      onError,
    );
  });

  return () => unsubs.forEach((unsub) => unsub());
}

function withCollection(snap, collectionName) {
  return { id: snap.id, _collection: collectionName, ...snap.data() };
}

function sortCategories(items) {
  return [...items].sort((a, b) => {
    const orderDiff = (Number(a.order) || 0) - (Number(b.order) || 0);
    if (orderDiff) return orderDiff;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function sortArticles(items) {
  return [...items].sort((a, b) => {
    const orderDiff = (Number(a.order) || 0) - (Number(b.order) || 0);
    if (orderDiff) return orderDiff;
    const aCreated = a.createdAt?.toMillis?.() || 0;
    const bCreated = b.createdAt?.toMillis?.() || 0;
    return bCreated - aCreated;
  });
}
