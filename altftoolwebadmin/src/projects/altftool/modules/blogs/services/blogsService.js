import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const PROJECT_ID = "altftool";

const col = (module) =>
  collection(db, "projects", PROJECT_ID, module);

const docRef = (module, id) =>
  doc(db, "projects", PROJECT_ID, module, id);

/* ─────────────────────────────────────────────
   Categories
───────────────────────────────────────────── */

export async function fetchCategories() {
  const q = query(col("categories"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
}

export const fetchCategoryNames = async () => {
  const snapshot = await getDocs(col("categories"));
  return snapshot.docs.map((doc) => doc.data().name);
};

export async function createCategories(names) {
  return Promise.all(
    names.map(async (name) => {
      const refDoc = doc(col("categories"));
      await setDoc(refDoc, {
        name,
        createdAt: serverTimestamp(),
      });
      return refDoc;
    })
  );
}

export async function deleteCategory(id) {
  await deleteDoc(docRef("categories", id));
}

/* ─────────────────────────────────────────────
   Blog Reads
───────────────────────────────────────────── */

export async function fetchBlogById(id) {
  const snap = await getDoc(docRef("blogs", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchAllBlogs() {
  const snap = await getDocs(col("blogs"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBlogCount() {
  const snap = await getCountFromServer(col("blogs"));
  return snap.data().count;
}

export async function fetchBlogsPage({ pageSize, cursor }) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(col("blogs"), ...constraints);
  const snap = await getDocs(q);

  const blogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { blogs, lastDoc };
}

/* ─────────────────────────────────────────────
   Blog Writes
───────────────────────────────────────────── */

export async function createBlog(payload) {
  const refDoc = doc(col("blogs"));

  await setDoc(refDoc, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return refDoc;
}

export async function updateBlog(id, payload) {
  await updateDoc(docRef("blogs", id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBlogImage(id, imageUrl) {
  await updateDoc(docRef("blogs", id), {
    image: imageUrl,
  });
}

export async function updateBlogStatus(id, status) {
  await updateDoc(docRef("blogs", id), {
    status,
  });
}

export async function deleteBlog(id) {
  await deleteDoc(docRef("blogs", id));
}

export async function bulkDeleteBlogs(ids) {
  await Promise.all(ids.map((id) => deleteBlog(id)));
}

/* ─────────────────────────────────────────────
   Storage
───────────────────────────────────────────── */

export function uploadBlogImage({ file, blogId, onProgress, onTaskReady }) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `blogs/${blogId}`);
    const task = uploadBytesResumable(storageRef, file);

    if (onTaskReady) onTaskReady(task);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          );
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/* ─────────────────────────────────────────────
   Comments (Realtime)
───────────────────────────────────────────── */

export function subscribeToComments(blogId, onUpdate, onError) {
  const q = query(
    collection(db, "projects", PROJECT_ID, "blogs", blogId, "comments"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) =>
      onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function deleteComment(blogId, commentId) {
  const ref = doc(
    db,
    "projects",
    PROJECT_ID,
    "blogs",
    blogId,
    "comments",
    commentId
  );

  await deleteDoc(ref);
}