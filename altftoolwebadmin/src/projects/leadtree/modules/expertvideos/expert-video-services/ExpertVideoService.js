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
    setDoc,
    updateDoc,
} from "firebase/firestore";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "leadtree";

const col = (...segments) =>
    collection(db, "projects", PROJECT_ID, ...segments);

const docRef = (...segments) =>
    doc(db, "projects", PROJECT_ID, ...segments);

// ── Categories
export async function fetchCategories() {
    const q = query(col("expertVideoCategories"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, name: d.data().name || "" }));
}

export const fetchCategoryNames = async () => {
    const snap = await getDocs(col("expertVideoCategories"));
    return snap.docs.map((d) => (d.data().name || "").trim()).filter(Boolean);
};

export async function createCategories(names) {
    return Promise.all(
        names.map(async (name) => {
            const cleanName = name.trim();
            if (!cleanName) return null;
            const refDoc = doc(col("expertVideoCategories"));
            await setDoc(refDoc, { name: cleanName, createdAt: serverTimestamp() });
            return refDoc;
        })
    );
}

export async function deleteCategory(id) {
    await deleteDoc(docRef("expertVideoCategories", id));
}

// ── Video Count
export async function fetchVideoCount() {
    const snap = await getCountFromServer(col("blogexpertvideos"));
    return snap.data().count;
}

// ── Video Reads
export async function fetchVideoById(id) {
    const snap = await getDoc(docRef("blogexpertvideos", id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function fetchAllVideos() {
    const snap = await getDocs(col("blogexpertvideos"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchVideosPage({ pageSize, cursor }) {
    const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
    if (cursor) constraints.push(startAfter(cursor));

    const q = query(col("blogexpertvideos"), ...constraints);
    const snap = await getDocs(q);

    const videos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

    // ✅ Fixed: was returning undefined `cards` variable
    return { videos, lastDoc };
}

// ── Video Create
export async function createVideoPost(payload) {
    const refDoc = doc(col("blogexpertvideos"));
    try {
        await setDoc(refDoc, {
            ...payload,
            category: (payload.category || "").trim(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error("❌ FIRESTORE ERROR:", err);
        throw err; // ✅ re-throw so caller knows it failed
    }
    return refDoc;
}

// ── Video Update
export async function updateVideo(id, payload) {
    await updateDoc(docRef("blogexpertvideos", id), {
        ...payload,
        updatedAt: serverTimestamp(),
    });
}

export async function updateVideoThumbnail(id, imageUrl) {
    await updateDoc(docRef("blogexpertvideos", id), { thumbnailUrl: imageUrl });
}

export async function updateVideoStatus(id, status) {
    await updateDoc(docRef("blogexpertvideos", id), { status });
}

// ── Video Delete
export async function deleteVideo(id) {
    await deleteDoc(docRef("blogexpertvideos", id));
}

export async function bulkDeleteVideos(ids) {
    await Promise.all(ids.map((id) => deleteVideo(id)));
}

// ── Storage — Thumbnail image upload
export function uploadThumbnailImage({ file, thumbnailImgId, onProgress, onTaskReady }) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `blogexpertvideos/thumbnails/${thumbnailImgId}`);
        const task = uploadBytesResumable(storageRef, file);

        if (onTaskReady) onTaskReady(task);

        task.on(
            "state_changed",
            (snap) => {
                if (onProgress) {
                    onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
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



export function uploadauthorImage({
  file,
  authorImgId,
  onProgress,
  onTaskReady,
}) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(
      storage,
      `blogexpertvideos/authorImg/${authorImgId}`,
    );
    const task = uploadBytesResumable(storageRef, file);

    if (onTaskReady) onTaskReady(task);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
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
      },
    );
  });
}

// ✅ New — Video file upload (was missing completely)
export function uploadVideoFile({ file, videoId, onProgress, onTaskReady }) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `blogexpertvideos/videos/${videoId}`);
        const task = uploadBytesResumable(storageRef, file);

        if (onTaskReady) onTaskReady(task);

        task.on(
            "state_changed",
            (snap) => {
                if (onProgress) {
                    onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
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