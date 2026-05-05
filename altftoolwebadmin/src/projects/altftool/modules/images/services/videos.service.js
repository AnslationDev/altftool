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
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =========================
   CONFIG
========================= */

const PROJECT_ID = "altftool";
const videosRef = collection(db, "projects", PROJECT_ID, "videos");

/* =========================
   HELPERS
========================= */

function mapDocs(snap) {
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* =========================
   READ
========================= */

/**
 * Cursor-based pagination
 */
export async function fetchVideosPage({ pageSize, cursor }) {
  const constraints = [
    orderBy("uploadedAt", "desc"),
    limit(pageSize),
  ];

  if (cursor) constraints.push(startAfter(cursor));

  const q = query(videosRef, ...constraints);
  const snap = await getDocs(q);

  const data = mapDocs(snap);
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { data, lastDoc };
}

/**
 * Total count (for pagination UI)
 */
export async function fetchVideosCount() {
  const snap = await getCountFromServer(videosRef);
  return snap.data().count;
}

/* =========================
   CREATE
========================= */

export async function createVideo(data) {
  const ref = await addDoc(videosRef, {
    ...data,
    uploadedAt: serverTimestamp(),
  });

  // optional: store id inside doc (consistent with your other modules)
  await updateDoc(ref, { id: ref.id });

  return ref.id;
}

/* =========================
   UPDATE
========================= */

export async function updateVideo(videoId, updates) {
  const ref = doc(videosRef, videoId);

  return updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* =========================
   DELETE
========================= */

export async function deleteVideo(videoId) {
  const ref = doc(videosRef, videoId);
  return deleteDoc(ref);
}

export async function deleteVideosBulk(ids = []) {
  return Promise.all(ids.map((id) => deleteVideo(id)));
}