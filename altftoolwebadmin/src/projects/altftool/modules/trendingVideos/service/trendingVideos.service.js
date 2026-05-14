import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { clearFirebaseCache, getCachedFirebaseRead } from "@/lib/firebaseCache";
import {
  compactFirestoreData,
  normalizeTrendingVideo,
} from "@altftool/core/firebaseContent";
import { ALTFT_TRENDING_VIDEOS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

/* =========================
   CONFIG
========================= */

const videosRef = () => collection(db, ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH);
const ALL_VIDEOS_CACHE_KEY = "admin:trending-videos:all";
const VIDEO_COUNT_CACHE_KEY = "admin:trending-videos:count";

function clearVideosCache() {
  clearFirebaseCache(ALL_VIDEOS_CACHE_KEY);
  clearFirebaseCache(VIDEO_COUNT_CACHE_KEY);
}

/* =========================
   READ
========================= */

/**
 * Fetch all trending videos, ordered by createdAt desc.
 * Returns an array of { id, ...data } objects.
 */
export async function getAllVideos() {
  return getCachedFirebaseRead(ALL_VIDEOS_CACHE_KEY, async () => {
    const q = query(videosRef(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTrendingVideo(d.data(), d.id));
  }, 30000);
}

/**
 * Paginated fetch.
 * @param {number} pageSize
 * @param {import("firebase/firestore").QueryDocumentSnapshot|null} lastDoc
 * @returns {{ videos: object[], lastDoc: QueryDocumentSnapshot|null }}
 */
export async function getVideosPaginated(pageSize = 20, lastDoc = null) {
  let q = query(videosRef(), orderBy("createdAt", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const videos = snap.docs.map((d) => normalizeTrendingVideo(d.data(), d.id));
  const newLastDoc = snap.docs[snap.docs.length - 1] ?? null;
  return { videos, lastDoc: newLastDoc };
}

/**
 * Get total count of videos in the collection.
 */
export async function getVideosCount() {
  return getCachedFirebaseRead(VIDEO_COUNT_CACHE_KEY, async () => {
    const snap = await getCountFromServer(videosRef());
    return snap.data().count;
  }, 30000);
}

/* =========================
   CREATE
========================= */

/**
 * Add a new video document. Firestore auto-generates the ID.
 * @param {object} payload  — shape matches VideoModal's payload (minus `id`)
 * @returns {string} The new document ID.
 */
export async function createVideo(payload) {
  // Strip any client-generated id; Firestore will assign one
  const { id: _ignored, videoFile: _file, ...data } = payload;
  const { id: _id, firestoreId: _firestoreId, ...normalized } =
    compactFirestoreData(normalizeTrendingVideo(data));

  const docRef = await addDoc(videosRef(), {
    ...normalized,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  clearVideosCache();
  return docRef.id;
}

/* =========================
   UPDATE
========================= */

/**
 * Update an existing video document by Firestore document ID.
 * @param {string} docId      — Firestore document ID (video.firestoreId)
 * @param {object} payload    — partial or full video payload
 */
export async function updateVideo(docId, payload) {
  const { id: _ignored, videoFile: _file, ...data } = payload;
  const { id: _id, firestoreId: _firestoreId, ...normalized } =
    compactFirestoreData(normalizeTrendingVideo(data, docId));

  const ref = doc(db, ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, docId);
  await updateDoc(ref, {
    ...normalized,
    updatedAt: serverTimestamp(),
  });
  clearVideosCache();
}

/* =========================
   DELETE
========================= */

/**
 * Delete a single video by Firestore document ID.
 * @param {string} docId
 */
export async function deleteVideo(docId) {
  const ref = doc(db, ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, docId);
  await deleteDoc(ref);
  clearVideosCache();
}

/**
 * Batch-delete multiple videos by their Firestore document IDs.
 * Firestore batches are capped at 500 ops; this handles chunking automatically.
 * @param {string[]} docIds
 */
export async function deleteVideos(docIds) {
  const BATCH_LIMIT = 500;

  for (let i = 0; i < docIds.length; i += BATCH_LIMIT) {
    const chunk = docIds.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);
    chunk.forEach((docId) => {
      const ref = doc(db, ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, docId);
      batch.delete(ref);
    });
    await batch.commit();
  }

  clearVideosCache();
}

/* =========================
   TOGGLE
========================= */

/**
 * Toggle the isPlaying field on a video document.
 * @param {string} docId
 * @param {boolean} currentValue
 */
export async function toggleVideoPlay(docId, currentValue) {
  const ref = doc(db, ...ALTFT_TRENDING_VIDEOS_COLLECTION_PATH, docId);
  await updateDoc(ref, {
    isPlaying: !currentValue,
    updatedAt: serverTimestamp(),
  });
}
